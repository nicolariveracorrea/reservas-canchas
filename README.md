# Funcapaze | Reservas de Canchas

Aplicacion web para consultar disponibilidad y gestionar reservas de canchas por hora. Esta publicada como sitio estatico con GitHub Pages y funciona en computadores, Android y iPhone.

**Sitio publico:** https://nicolariveracorrea.github.io/reservas-canchas/

## Funcionalidades

- Reserva de una de las 10 canchas entre las 8:00 a.m. y las 10:00 p.m.
- Validacion de fecha, horario, telefono, correo y anticipacion minima de 15 minutos.
- Disponibilidad independiente por cancha, fecha y franja horaria.
- Envio de la solicitud de reserva a WhatsApp.
- Panel de disponibilidad, contador de reservas y grafico por horario.
- Programa de fidelidad por telefono: cada reserva acumula un sello; al completar 10, se habilita una hora gratis.
- Consulta y cancelacion de reservas mediante el telefono del cliente.
- Diseno responsive para computador, Android y iPhone.

## Uso

1. Ingresa fecha, cancha, horario, nombre, telefono y correo.
2. Pulsa **Reservar por WhatsApp** para enviar la solicitud.
3. El cliente acumula un sello por cada reserva pagada.
4. Al llegar a 10 sellos, aparece la opcion **Usar una hora gratis** durante la siguiente reserva.
5. En **Mis reservas**, ingresa el telefono usado en la reserva y pulsa **Cancelar reserva** cuando sea necesario.

La cancelacion libera la cancha y actualiza el contador, la disponibilidad y el grafico.

## Ejecucion local

No requiere dependencias ni proceso de compilacion. Abre `index.html` en un navegador o inicia un servidor estatico:

```powershell
npx --yes http-server . -p 8080 -c-1
```

Abre `http://127.0.0.1:8080`.

## Estructura

| Archivo                              | Responsabilidad                                               |
| ------------------------------------ | ------------------------------------------------------------- |
| `index.html`                         | Estructura de la interfaz y formularios.                      |
| `styles.css`                         | Tema albiceleste, diseño responsive y estados visuales.       |
| `script.js`                          | Reservas, disponibilidad, fidelidad, cancelaciones y grafico. |
| `config.js`                          | URL configurable del webhook de n8n.                          |
| `n8n-reservas-workflow.json`         | Flujo importable de n8n para recibir reservas.                |
| `.github/workflows/deploy-pages.yml` | Despliegue automatico en GitHub Pages.                        |

## Almacenamiento actual

Las reservas y cuentas de fidelidad se almacenan en `localStorage` del navegador. Esto permite conservarlas despues de recargar en el mismo dispositivo.

Mientras no se conecte una base de datos o n8n, las reservas no se sincronizan entre distintos navegadores o dispositivos. Para uso operativo con clientes reales se recomienda completar la integracion con n8n y una fuente de datos centralizada.

## Integracion con n8n

1. Importa `n8n-reservas-workflow.json` en una instancia publica de n8n con HTTPS.
2. Activa el flujo y copia la URL **Production** de su webhook.
3. En `config.js`, asigna la URL:

```js
window.RESERVAS_CONFIG = {
  n8nWebhookUrl: "https://tu-instancia-n8n/webhook/reservas-canchas",
};
```

4. Configura CORS para permitir `https://nicolariveracorrea.github.io`.
5. Sube el cambio a `main`.

Consulta [N8N_SETUP.md](N8N_SETUP.md) para el detalle del flujo.

## Publicacion

Cada cambio enviado a la rama `main` se publica automaticamente con GitHub Actions. El flujo genera nombres versionados para CSS y JavaScript, evitando que los navegadores reciban recursos antiguos desde cache.

```powershell
git add .
git commit -m "Describe el cambio"
git push origin main
```

## Tecnologias

- HTML5
- CSS3
- JavaScript sin dependencias
- GitHub Pages y GitHub Actions
- n8n, opcional para automatizacion y sincronizacion externa
