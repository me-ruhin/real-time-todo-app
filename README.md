# Real-Time Todo App

A real-time collaborative todo list using Node.js, React, MongoDB, Redis, and Docker.

## Features
- Real-time updates with Socket.IO
- Task locking so only one user can process a task at a time
- Scalable with Redis pub/sub

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Running the App

1. Clone the repository
2. Build and start all services:
   ```sh
   docker-compose up --build
   ```
3. Access the frontend at [http://localhost:3000](http://localhost:3000)
4. The backend API runs at [http://localhost:5000](http://localhost:5000)

### Stopping the App

```sh
docker-compose down
```

## Project Structure
- `backend/` - Node.js + Express + Socket.IO + MongoDB + Redis
- `frontend/` - React + Socket.IO-client

---

Feel free to contribute or open issues! 