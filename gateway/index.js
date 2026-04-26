require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors({
    origin: [
        process.env.DASHBOARD_URL, // http://localhost:8081
        "https://andrea-ministrative-nonharmoniously.ngrok-free.dev" // El ngrok actual de la app móvil
    ],
    credentials: true
}));


const onProxyRes = (proxyRes) => {
    delete proxyRes.headers['access-control-allow-origin'];
    delete proxyRes.headers['access-control-allow-methods'];
    delete proxyRes.headers['access-control-allow-credentials'];
    delete proxyRes.headers['access-control-allow-headers'];
};

// --- AUTH SERVICE ---
app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    onProxyRes
}));

// --- USER / PROFILE / SEARCH SERVICE ---
app.use('/api/academic-profile', createProxyMiddleware({
    target: `${process.env.USER_SERVICE_URL}/profile`,
    changeOrigin: true,
    onProxyRes
}));
app.use('/api/search-students', createProxyMiddleware({
    target: `${process.env.USER_SERVICE_URL}/search`,
    changeOrigin: true,
    onProxyRes
}));

// --- SOCIAL SERVICE (Groups & Events) ---
app.use('/api/events', createProxyMiddleware({
    target: `${process.env.SOCIAL_SERVICE_URL}/events`,
    changeOrigin: true,
    onProxyRes
}));

app.use('/api/groups', createProxyMiddleware({
    target: `${process.env.SOCIAL_SERVICE_URL}/groups`,
    changeOrigin: true,
    onProxyRes
}));

// --- CHAT SERVICE ---
app.use('/api/chat', createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL,
    changeOrigin: true,
    onProxyRes: (proxyRes, req, res) => {
        onProxyRes(proxyRes);
    },
    onProxyReq: (proxyReq, req, res) => {
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
app.use('/api/careers', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/careers`,
    changeOrigin: true,
    onProxyRes
}));

app.use('/api/career-structure', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/career-structure`,
    changeOrigin: true,
    onProxyRes
}));

app.use('/api/subjects', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/subjects`,
    changeOrigin: true,
    onProxyRes
}));

app.use('/api/hierarchy/faculties', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/faculties`,
    changeOrigin: true,
    onProxyRes
}));

app.use('/api/hierarchy/academic-levels', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/academic-levels`,
    changeOrigin: true,
    onProxyRes
}));

app.use('/api/hierarchy/formation-levels', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/formation-levels`,
    changeOrigin: true,
    onProxyRes
}));

app.use('/api/hierarchy/careers-by-path', createProxyMiddleware({
    target: `${process.env.ACADEMIC_SERVICE_URL}/careers-by-path`,
    changeOrigin: true,
    onProxyRes
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