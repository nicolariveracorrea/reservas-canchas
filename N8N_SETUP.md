# Conectar n8n

1. Crea una instancia publica de n8n con HTTPS. Puedes usar una cuenta de prueba de n8n Cloud o una instancia propia que permanezca encendida.
2. En n8n importa `n8n-reservas-workflow.json` y activa el flujo.
3. Abre el nodo `Nueva reserva web`, copia su URL **Production** y pegala como valor de `n8nWebhookUrl` en `config.js`.
4. En las opciones del nodo Webhook permite CORS desde `https://nicolariveracorrea.github.io`. Si tu instalacion de n8n usa un proxy inverso, configura ese origen permitido en el proxy.
5. Sube el cambio a la rama `main`. GitHub Pages publicara automaticamente la nueva configuracion.

El webhook recibira: identificador de reserva, fecha, cliente, telefono, correo, cancha, horario y precio. Despues del nodo `Confirmar recepcion` puedes agregar acciones como guardar la reserva en Google Sheets, enviar un correo o notificar por WhatsApp.

No uses la URL de prueba (`/webhook-test/`) en `config.js`; deja de funcionar fuera del modo de prueba de n8n.