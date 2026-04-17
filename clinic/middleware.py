"""
Middleware for handling and logging security related events.
"""
# pylint: disable=too-few-public-methods
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('django')

class SecurityLoggingMiddleware(MiddlewareMixin):
    """
    Middleware that logs unauthorized access attempts.
    """
    def process_response(self, request, response):
        """
        Process the response to log 401 and 403 status codes.
        """
        if response.status_code in [401, 403]:
            user = 'Anonymous'
            if hasattr(request, 'user') and request.user.is_authenticated:
                user = request.user
            path = request.path
            method = request.method

            # Log highly visible warning to console
            logger.warning(
                "SECURITY ALERT | Unauthorized Access Attempt Blocked! "
                "| User: %s | Method: %s | Path: %s",
                user, method, path
            )

        return response
