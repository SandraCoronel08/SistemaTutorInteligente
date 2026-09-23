# Pruebas responsive

Las pruebas responsive verifican que la interfaz sea usable en escritorio, notebook, tablet y celular. La validacion se realizo luego de ajustar login, registro, chat, sidebar, header, mensajes, input y botones.

| ID | Resolucion | Dispositivo de referencia | Login visible | Registro visible | Chat visible | Sidebar usable | Input visible | Mensajes legibles | Sin scroll horizontal | Envio funcionando | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RES-001 | 1920 x 1080 | Escritorio | Si | Si | Si | Si, fijo | Si | Si | Si | Si | Aprobado |
| RES-002 | 1366 x 768 | Notebook | Si | Si | Si | Si, fijo | Si | Si | Si | Si | Aprobado |
| RES-003 | 1024 x 768 | Tablet horizontal | Si | Si | Si | Si, compacto | Si | Si | Si | Si | Aprobado |
| RES-004 | 768 x 1024 | Tablet vertical | Si | Si | Si | Si, drawer | Si | Si | Si | Si | Aprobado |
| RES-005 | 390 x 844 | Celular | Si | Si | Si | Si, hamburguesa | Si | Si | Si | Si | Aprobado |
| RES-006 | 360 x 740 | Celular pequeno | Si | Si | Si | Si, hamburguesa | Si | Si | Si | Si | Aprobado |

## Criterios verificados

- No existe scroll horizontal.
- Los formularios no se salen de pantalla.
- Los botones tienen tamano comodo para interaccion tactil.
- El chat ocupa el alto disponible.
- El area de mensajes posee scroll propio.
- El input permanece visible abajo.
- Las burbujas de mensajes no desbordan el ancho.
- Las sugerencias se muestran en una columna en celular.
- El sidebar se mantiene fijo en escritorio y funciona como drawer en tablet/celular.

## Procedimiento recomendado en DevTools

1. Abrir el frontend local.
2. Activar la barra de dispositivos de Chrome DevTools.
3. Cargar cada resolucion de la tabla.
4. Revisar login y registro.
5. Iniciar sesion con usuario de prueba.
6. Abrir y cerrar sidebar.
7. Enviar un mensaje corto.
8. Verificar que el input y los mensajes sigan visibles.
9. Confirmar que no aparezca scroll horizontal.

## Conclusion

La interfaz quedo adaptada a los tamanos definidos para el prototipo. En pantallas grandes conserva la distribucion con sidebar visible y panel deslizante de autenticacion; en pantallas pequenas prioriza layout vertical, drawer lateral, controles tactiles y lectura clara del chat.
