# pbc-web

PBC web site version 4.0

## Get Started

```
git clone https://github.com/ericsoderberg/pbc-web.git
```
```
cd pbc-web
```
```
npm install
```
Set up MongoDB
```
use admin
db.createUser(
  {
    user: "pbc",
    pwd: "pbc",
    roles: [ { role: "readWrite", db: "pbc" } ]
  }
)
```
Start the server
```
npm run start
```
Start the webpack development server
```
npm run dev
```
Point your browser to http://localhost:8080
