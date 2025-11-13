# 🚀 INSTRUCCIONES FINALES - Configurar Vercel

## 🎯 LO QUE DESCUBRIMOS

**El problema NO era el código, era la configuración de Vercel.**

`@sparticuz/chromium` **NO** incluye los binarios de Chromium en el paquete npm. Los binarios se deben descargar desde GitHub releases en runtime.

---

## ✅ PASO 1: Agregar Variable de Entorno en Vercel

### 1.1 Ir a Configuración de Vercel

Ve a: **https://vercel.com/[tu-organizacion]/landlord-audit/settings/environment-variables**

O navega:
1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** (arriba)
3. Click en **"Environment Variables"** (izquierda)

### 1.2 Agregar Variable

Click en **"Add New"**

| Campo | Valor |
|-------|-------|
| **Key** | `CHROMIUM_REMOTE_EXEC_PATH` |
| **Value** | `https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.tar.br` |
| **Environments** | ✅ Production<br>✅ Preview<br>✅ Development |

### 1.3 Guardar

1. Click **"Save"**
2. Aparecerá un mensaje: "Environment Variable created"

---

## ✅ PASO 2: Redesplegar (CRÍTICO)

**Las variables de entorno solo aplican a NUEVOS deployments.**

### Opción A: Nuevo Commit (Recomendado)
```bash
git commit --allow-empty -m "trigger: redeploy for env var"
git push origin main
```

### Opción B: Redeploy Manual
1. Ve a: **Deployments**
2. Click en los **3 puntos (...)** del deployment más reciente
3. Click en **"Redeploy"**
4. Confirmar

---

## ✅ PASO 3: Esperar Deployment

1. Ve a la pestaña **"Deployments"**
2. Espera a que el nuevo deployment muestre **"Ready"** (status verde)
3. Verifica que el commit sea: **`7f7592c`** o posterior

---

## ✅ PASO 4: Probar PDF Generation

### 4.1 Probar en Production

1. Ve a: `https://landlord-audit.vercel.app/dashboard/audit/17/report`
2. Click en **"Download PDF"**
3. Debería descargar el PDF completo 🎉

### 4.2 Verificar Logs en Vercel

1. Ve a: **Deployments → [último deployment] → Function Logs**
2. Busca `/api/reports/17`
3. Deberías ver:

```
✅ [Puppeteer] Launching browser...
✅ [Puppeteer] Chromium path: /tmp/chromium
✅ [Puppeteer] Remote exec path: https://github.com/Sparticuz/chromium/...
✅ [Puppeteer] Browser launched in 2000ms
✅ [Puppeteer] ✅ PDF generated in 3000ms
```

---

## ❓ Si Todavía Falla

### Si ves el MISMO error:
```
The input directory "/var/task/node_modules/@sparticuz/chromium/bin" does not exist
```

**Significa:**
- La variable de entorno NO se aplicó todavía
- Verifica que:
  1. La variable esté guardada correctamente
  2. Hiciste redeploy DESPUÉS de agregarla
  3. Estás probando en el deployment MÁS RECIENTE

### Si ves un ERROR DIFERENTE:

Copia el error completo y me lo pasas para debuggear.

---

## 📋 Resumen de Configuraciones Actuales

### `next.config.mjs` ✅
```javascript
serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium']
```

### `vercel.json` ✅
```json
{
  "functions": {
    "app/api/reports/[auditId]/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### Environment Variable ✅ (DEBES AGREGAR)
```
CHROMIUM_REMOTE_EXEC_PATH=https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.tar.br
```

---

## 🎉 Éxito Esperado

**Si todo funciona:**
1. ✅ PDF se descarga automáticamente
2. ✅ Contiene todas las páginas del reporte
3. ✅ No hay errores en console ni en Vercel logs

**Tiempo estimado:** ~3-5 segundos para generar el PDF la primera vez (descarga Chromium), ~1-2 segundos en requests subsecuentes (Chromium cacheado).

---

## 📚 Documentación Adicional

- `VERCEL-CHROMIUM-SOLUTION.md` - Explicación técnica detallada
- `VERCEL-PDF-SETUP.md` - Setup completo de Puppeteer
- [Vercel + Puppeteer Official Guide](https://vercel.com/guides/deploying-puppeteer-with-nextjs-on-vercel)

---

**¡AVÍSAME CUANDO AGREGUES LA VARIABLE Y PRUEBES!** 🚀

