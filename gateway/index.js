require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 1. Configuración de CORS para permitir peticiones de React Native (vía ngrok)
app.use(cors());

// 2. Definición de rutas basadas en tu monolito anterior

// --- AUTH SERVICE ---
app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
}));

// --- USER / PROFILE / SEARCH SERVICE ---
// Agrupamos perfiles y búsqueda de estudiantes según la sugerencia de la docente
app.use('/api/academic-profile', createProxyMiddleware({
    target: `${process.env.USER_SERVICE_URL}/profile`,
    changeOrigin: true,
}));
app.use('/api/search-students', createProxyMiddleware({
    target: `${process.env.USER_SERVICE_URL}/search`,
    changeOrigin: true,
}));

// --- SOCIAL SERVICE (Groups & Events) ---
app.use('/api/events', createProxyMiddleware({
    target: `${process.env.SOCIAL_SERVICE_URL}/events`,
    changeOrigin: true,
}));

app.use('/api/groups', createProxyMiddleware({
    target: `${process.env.SOCIAL_SERVICE_URL}/groups`,
    changeOrigin: true,
}));

// --- CHAT SERVICE ---
app.use('/api/chat', createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        // Si el microservicio necesita el cuerpo original para procesar el archivo
        if (req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    }
}));

// --- GROUP CHAT SERVICE ---
app.use('/api/group-chats', createProxyMiddleware({
    target: `${process.env.CHAT_SERVICE_URL}/groups`,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        if (req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    }
}));

// --- ACADEMIC SERVICE ---
// Redirecciones explícitas para las llamadas de la API de React Native (Hierarchy, Careers, Subjects)
app.use('/api/careers', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/careers`,
    changeOrigin: true,
}));

app.use('/api/career-structure', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/career-structure`,
    changeOrigin: true,
}));

app.use('/api/subjects', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/subjects`,
    changeOrigin: true,
}));

// Rutas de selector de jerarquías (AcademicHierarchySelector)
app.use('/api/hierarchy/faculties', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/faculties`,
    changeOrigin: true,
}));

app.use('/api/hierarchy/academic-levels', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/academic-levels`,
    changeOrigin: true,
}));

app.use('/api/hierarchy/formation-levels', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/formation-levels`,
    changeOrigin: true,
}));

app.use('/api/hierarchy/careers-by-path', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/careers-by-path`,
    changeOrigin: true,
}));

// 3. Health Check (Para saber si el gateway está vivo)
app.get('/status', (req, res) => {
    res.json({ status: 'Gateway Operativo', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway UniConnect corriendo en puerto ${PORT}`);
    console.log(`🔗 Exponiendo servicios a través de ngrok en el puerto ${PORT}`);
});