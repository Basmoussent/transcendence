FROM owasp/modsecurity-crs:nginx

USER root
COPY entrypoint.sh /entrypoint.sh
COPY nginx.conf.template /etc/nginx/nginx.conf
COPY modsecurity.conf /etc/nginx/modsecurity.conf
COPY cors.conf.template /etc/nginx/cors.conf
RUN chmod +x /entrypoint.sh

EXPOSE 80 243
ENTRYPOINT ["/entrypoint.sh"]
