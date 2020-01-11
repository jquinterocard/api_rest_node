# API REST NODEJS-EXPRESS

Api que expone un conjunto rutas http para ser consumidas

## POST /register
Create new user

* Content-Type:"application/json"

```
{
  "name":"test",
  "surname":"surname test",
  "email":"email@email.com",
  "password":"password_test"
}
```

## POST /login
Autorizations with jwt

* Content-Type:"application/json"

```
{
  "username":"test",
  "password":"password_test",
}
```

## PUT /user/update
Update user data

* Content-Type:"application/json"
* Authorization:token

```
{
  "name":"test",
  "surname":"surname test",
  "email":"email@email.com",
  "password":"password_test"
}
```
