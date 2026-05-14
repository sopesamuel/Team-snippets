package main

import (
	"net/http"

	"github.com/justinas/alice"
)

func (app *application) routes() http.Handler {

	mux := http.NewServeMux()

	mux.HandleFunc("GET /ping", ping)

	dynamic := alice.New(app.sessionManager.LoadAndSave, app.authenticate)

	
	mux.Handle("GET /{$}", dynamic.ThenFunc(app.home))
	mux.Handle("GET /snippet/view/{id}", dynamic.ThenFunc(app.snippetView))
	
	mux.Handle("POST /user/signup", dynamic.ThenFunc(app.userSignupPost))
	mux.Handle("POST /user/login", dynamic.ThenFunc(app.userLoginPost))
	
	protected := dynamic.Append(app.requireAuthentication)

	mux.Handle("GET /users", protected.ThenFunc(app.listUsers))
	mux.Handle("POST /snippet/create", protected.ThenFunc(app.snippetCreatePost))
	mux.Handle("POST /user/logout", protected.ThenFunc(app.userLogoutPost))
	mux.Handle("GET /account/view", protected.ThenFunc(app.accountView))
	mux.Handle("POST /snippet/share", protected.ThenFunc(app.snippetShare))
	mux.Handle("GET /snippet/shared", protected.ThenFunc(app.sharedWithMe))
	mux.Handle("POST /account/password/update", protected.ThenFunc(app.accountPasswordUpdatePost))
	standard := alice.New(app.enableCORS, app.recoverPanic, app.logRequest, commonHeaders)
	return standard.Then(mux)
	
}