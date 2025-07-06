# Real-Time Todo App

A real-time collaborative todo list built with Node.js, React, MongoDB, Redis, and NGINX load balancer. Supports horizontal scaling, real-time updates, and task locking.

---

## Features
- Real-time updates with Socket.IO
- Task locking: only one user can process a task at a time
- Scalable backend with Docker Compose and NGINX load balancer
- Redis for Socket.IO pub/sub
- MongoDB for persistent storage
- Instance ID display: see which backend instance served your request

---

## Architecture

```
[Browser]
   |
[NGINX Load Balancer] (port 80)
   |
[Multiple Backend Containers (Node.js + Socket.IO)]
   |
[MongoDB]   [Redis]
```

---

## Prerequisites
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd real-time-todo
```

### 2. Build and start all services
```sh
docker-compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Load Balancer: [http://localhost](http://localhost)
- Backend API: [http://localhost:5001](http://localhost:5001)

### 3. Stop all services
```sh
docker-compose down
```

### 4. Remove all containers, networks, and volumes (cleanup)
```sh
docker-compose down --volumes --remove-orphans
```

### 5. Prune all unused Docker resources (if needed)
```sh
docker system prune -f
```

---

## Scaling Backend Instances

To scale the backend horizontally:
```sh
docker-compose up --scale backend=3 --build
```
- NGINX will load balance requests across all backend instances.
- The frontend will show which backend instance served your request.

---

## Health Check
- NGINX health endpoint: [http://localhost/health](http://localhost/health)

---

## Troubleshooting
- **Port already allocated:**
  - Run `docker-compose down --remove-orphans` and try again.
- **Container name conflict:**
  - Run `docker system prune -f` to remove unused containers and networks.
- **Frontend not showing instance ID:**
  - Make sure you are accessing via [http://localhost](http://localhost) (NGINX), not directly on port 3000.
- **Logs:**
  - View logs for a service: `docker-compose logs <service>` (e.g., `backend`, `frontend`, `nginx`)

---

## Project Structure
- `backend/` - Node.js + Express + Socket.IO + MongoDB + Redis
- `frontend/` - React + Socket.IO-client
- `nginx.conf` - NGINX load balancer config
- `docker-compose.yml` - Orchestrates all services

---

## Customization
- To add more backend features, edit `backend/src/index.js`.
- To improve the UI, edit `frontend/src/App.js`.
- To change NGINX load balancing, edit `nginx.conf`.

---

## License
MIT 