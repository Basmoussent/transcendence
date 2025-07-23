storage "file" {
  path = "/vault/data"
}

listener "tcp" {
  address = "0.0.0.0:8200"
  tls_disable = false
  tls_cert_file = "/vault/selfsigned.crt"
  tls_key_file = "/vault/selfsigned.key"
  api_addr = "https://vault:8200"

}

ui = true
log_level = "INFO"
disable_mlock = true


