"""Flask application factory for CrowdWise backend with dual prefix (/api and /api/v1) support."""
import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from app.config import Config
from app.utils.envelope import api_response

logger = logging.getLogger(__name__)
db = SQLAlchemy()


def create_app(config_class=Config) -> Flask:
    """Application factory for CrowdWise Flask REST API."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})

    # Create tables on startup if using SQLite and tables don't exist
    from app.models.transit import Base as TransitBase
    from app.models.demand import Base as DemandBase
    with app.app_context():
        try:
            db_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
            is_existing_db = False
            if "sqlite:///" in db_uri:
                db_path = db_uri.replace("sqlite:///", "")
                if os.path.exists(db_path) and os.path.getsize(db_path) > 1024 * 1024:
                    is_existing_db = True

            if not is_existing_db:
                TransitBase.metadata.create_all(db.engine)
                DemandBase.metadata.create_all(db.engine)

            from sqlalchemy import text
            mode_row = db.session.execute(text("SELECT value FROM sys_runtime_metadata WHERE key = 'data_mode' LIMIT 1")).scalar()
            if mode_row:
                app.config["DATA_MODE"] = str(mode_row).strip()
        except Exception as e:
            logger.warning(f"Database initialization warning: {e}")

        # Pre-warm ML service artifacts in background so user requests are instant
        try:
            from app.services.ml_service import MLService
            MLService.get_instance()
        except Exception as e:
            logger.warning(f"MLService warm-up warning: {e}")

    # Import blueprints
    from app.routes.health import bp as health_bp
    from app.routes.stops import bp as stops_bp
    from app.routes.routes import bp as routes_bp
    from app.routes.crowd import bp as crowd_bp
    from app.routes.journey import bp as journey_bp
    from app.routes.analytics import bp as analytics_bp

    # Register blueprints under dual prefixes: /api and /api/v1
    prefixes = [
        ("/api", ""),
        ("/api/v1", "_v1"),
    ]
    for pfx, suffix in prefixes:
        app.register_blueprint(health_bp, url_prefix=pfx, name=f"health{suffix}")
        app.register_blueprint(stops_bp, url_prefix=f"{pfx}/stops", name=f"stops{suffix}")
        app.register_blueprint(routes_bp, url_prefix=f"{pfx}/routes", name=f"routes{suffix}")
        app.register_blueprint(crowd_bp, url_prefix=pfx, name=f"crowd{suffix}")
        app.register_blueprint(journey_bp, url_prefix=pfx, name=f"journey{suffix}")
        app.register_blueprint(analytics_bp, url_prefix=pfx, name=f"analytics{suffix}")

    # Global Error Handlers with standard envelope
    @app.errorhandler(400)
    def bad_request(e):
        return api_response(
            error={"code": "BAD_REQUEST", "message": str(e.description if hasattr(e, "description") else e)},
            status_code=400,
        )

    @app.errorhandler(404)
    def not_found(e):
        msg = str(e.description if hasattr(e, "description") else "The requested resource was not found.")
        return api_response(
            error={"code": "NOT_FOUND", "message": msg},
            status_code=404,
        )

    @app.errorhandler(405)
    def method_not_allowed(e):
        return api_response(
            error={"code": "METHOD_NOT_ALLOWED", "message": "The requested HTTP method is not allowed on this endpoint."},
            status_code=405,
        )

    @app.errorhandler(500)
    def server_error(e):
        logger.error(f"Internal 500 Server Error: {e}", exc_info=True)
        return api_response(
            error={"code": "INTERNAL_SERVER_ERROR", "message": "An internal server error occurred."},
            status_code=500,
            degraded_mode=True,
        )

    @app.errorhandler(Exception)
    def handle_unhandled_exception(e):
        logger.error(f"Unhandled Exception caught: {e}", exc_info=True)
        return api_response(
            error={"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred."},
            status_code=500,
            degraded_mode=True,
        )

    # Static frontend serving if dist/ exists
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
    if os.path.exists(frontend_dist):
        from flask import send_from_directory

        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path):
            if path.startswith("api/"):
                return api_response(
                    error={"code": "NOT_FOUND", "message": f"Endpoint /{path} not found."},
                    status_code=404,
                )
            if path and os.path.exists(os.path.join(frontend_dist, path)):
                return send_from_directory(frontend_dist, path)
            return send_from_directory(frontend_dist, "index.html")

    return app
