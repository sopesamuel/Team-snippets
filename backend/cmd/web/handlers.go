package main

import (
	"errors"
	"net/http"
	"strconv"
	"encoding/json"

	"snippetbox.project.sope/internal/models"
	"snippetbox.project.sope/internal/validator"
)



type userLoginForm struct {
    Email    string `form:"email" json:"email"`
    Password string `form:"password" json:"password"`
    validator.Validator `form:"-"`
}

type userSignupForm struct {
    Name     string `form:"name" json:"name"`
    Email    string `form:"email" json:"email"`
    Password string `form:"password" json:"password"`
    validator.Validator `form:"-"`
}

type snippetcreateForm struct {
    Title   string `form:"title" json:"title"`
    Content string `form:"content" json:"content"`
    Expires int    `form:"expires" json:"expires"`
    validator.Validator `form:"-"`
}
type changePasswordForm struct {
	Password            string `form:"password"`
	NewPassword         string `form:"newPassword"`
	ConfirmNewPassword  string `form:"confirmNewPassword"`
	validator.Validator `form:"-"`
}

func ping(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("OK"))
}

func (app *application) snippetShare(w http.ResponseWriter, r *http.Request) {
	var input struct {
		SnippetID    int `json:"snippet_id"`
		SharedWithID int `json:"shared_with_id"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		app.clientError(w, r, http.StatusBadRequest)
		return
	}

	ownerID := app.sessionManager.GetInt(r.Context(), "authenticatedUserID")

	if ownerID == input.SharedWithID {
    app.writeJSON(w, http.StatusBadRequest, map[string]string{"message": "You cannot share a snippet with yourself"})
    return
}

	err = app.shares.Insert(input.SnippetID, ownerID, input.SharedWithID)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusCreated, map[string]string{"message": "snippet shared successfully"})
}

func (app *application) sharedWithMe(w http.ResponseWriter, r *http.Request) {
	userID := app.sessionManager.GetInt(r.Context(), "authenticatedUserID")

	snippets, err := app.shares.GetSharedWithUser(userID)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusOK, snippets)
}

func (app *application) home(w http.ResponseWriter, r *http.Request) {
	snippets, err := app.snippets.Latest()
	if err != nil {
		app.serverError(w, r, err)
		return
	}
	app.writeJSON(w, http.StatusOK, snippets)
}

func (app *application) snippetView(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || id < 1 {
		http.NotFound(w, r)
		return
	}

	snippet, err := app.snippets.Get(id)
	if err != nil {
		if errors.Is(err, models.ErrNoRecord) {
			http.NotFound(w, r)
		} else {
			app.serverError(w, r, err)
		}
		return
	}
	app.writeJSON(w, http.StatusOK, snippet)
}

func (app *application) snippetCreatePost(w http.ResponseWriter, r *http.Request) {
	var form snippetcreateForm

	err := json.NewDecoder(r.Body).Decode(&form)
	if err != nil {
		app.clientError(w, r, http.StatusBadRequest)
		return
	}

	form.CheckField(validator.NotBlank(form.Title), "Title", "Field cannot be empty!")
	form.CheckField(validator.MaxChar(form.Title, 100), "Title", "Value characters cannot exceed 100!")
	form.CheckField(validator.NotBlank(form.Content), "Content", "Field cannot be empty!")
	form.CheckField(validator.PermittedValue(form.Expires, 1, 7, 365), "Expires", "Invalid value, expiry date value has to be 1, 7 or 365")

	if !form.Valid() {
		app.writeJSON(w, http.StatusUnprocessableEntity, form)
		return
	}

	id, err := app.snippets.Insert(form.Title, form.Content, form.Expires)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusCreated, map[string]int{"id": id})
}

func (app *application) userSignupPost(w http.ResponseWriter, r *http.Request) {
	var form userSignupForm

	err := json.NewDecoder(r.Body).Decode(&form)
	if err != nil {
		app.clientError(w, r, http.StatusBadRequest)
		return
	}

	form.CheckField(validator.NotBlank(form.Name), "Name", "Field cannot be empty!")
	form.CheckField(validator.NotBlank(form.Email), "Email", "Field cannot be empty!")
	form.CheckField(validator.Matches(form.Email, validator.EmailRX), "Email", "Invalid email format!")
	form.CheckField(validator.NotBlank(form.Password), "Password", "Field cannot be empty!")
	form.CheckField(validator.MinChars(form.Password, 8), "Password", "Password must be 8 characters long!")

	if !form.Valid() {
		app.writeJSON(w, http.StatusUnprocessableEntity, form)
		return
	}

	err = app.users.Insert(form.Name, form.Email, form.Password)
	if err != nil {
		if errors.Is(err, models.ErrDuplicateEmail) {
			form.AddField("Email", "This email is already in use!")
			app.writeJSON(w, http.StatusUnprocessableEntity, form)
			return
		}
		app.serverError(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusCreated, map[string]string{"message": "signup successful"})
}

func (app *application) userLoginPost(w http.ResponseWriter, r *http.Request) {
	var form userLoginForm

	err := json.NewDecoder(r.Body).Decode(&form)
	if err != nil {
		app.clientError(w, r, http.StatusBadRequest)
		return
	}

	form.CheckField(validator.NotBlank(form.Email), "Email", "Field cannot be blank!")
	form.CheckField(validator.NotBlank(form.Password), "Password", "Field cannot be blank!")
	form.CheckField(validator.Matches(form.Email, validator.EmailRX), "Email", "This field must be a valid email address!")
	form.CheckField(validator.MinChars(form.Password, 8), "Password", "Password must be 8 characters long!")

	if !form.Valid() {
		app.writeJSON(w, http.StatusUnprocessableEntity, form)
		return
	}

	id, err := app.users.Authenticate(form.Email, form.Password)
	if err != nil {
		if errors.Is(err, models.ErrInvalidCredentials) {
			app.writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Email or Password is incorrect!"})
			return
		}
		app.serverError(w, r, err)
		return
	}

	err = app.sessionManager.RenewToken(r.Context())
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.sessionManager.Put(r.Context(), "authenticatedUserID", id)
	app.writeJSON(w, http.StatusOK, map[string]string{"message": "login successful"})
}

func (app *application) userLogoutPost(w http.ResponseWriter, r *http.Request) {
	err := app.sessionManager.RenewToken(r.Context())
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.sessionManager.Remove(r.Context(), "authenticatedUserID")
	app.writeJSON(w, http.StatusOK, map[string]string{"message": "logged out successfully"})
}

func (app *application) accountView(w http.ResponseWriter, r *http.Request) {
	id := app.sessionManager.GetInt(r.Context(), "authenticatedUserID")

	user, err := app.users.Get(id)
	if err != nil {
		if errors.Is(err, models.ErrNoRecord) {
			app.writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "unauthorized"})
		} else {
			app.serverError(w, r, err)
		}
		return
	}

	app.writeJSON(w, http.StatusOK, user)
}

func (app *application) accountPasswordUpdatePost(w http.ResponseWriter, r *http.Request) {
	var form changePasswordForm

	err := json.NewDecoder(r.Body).Decode(&form)
	if err != nil {
		app.clientError(w, r, http.StatusBadRequest)
		return
	}

	form.CheckField(validator.NotBlank(form.Password), "password", "Field cannot be empty!")
	form.CheckField(validator.MinChars(form.Password, 8), "password", "Password must be 8 characters long!")
	form.CheckField(validator.NotBlank(form.NewPassword), "newPassword", "Field cannot be empty!")
	form.CheckField(validator.MinChars(form.NewPassword, 8), "newPassword", "Password must be 8 characters long!")
	form.CheckField(validator.NotBlank(form.ConfirmNewPassword), "confirmNewPassword", "Field cannot be empty!")
	form.CheckField(validator.MinChars(form.ConfirmNewPassword, 8), "confirmNewPassword", "Password must be 8 characters long!")
	form.CheckField(validator.MatchOthers(form.NewPassword, form.ConfirmNewPassword), "confirmNewPassword", "Passwords do not match!")

	if !form.Valid() {
		app.writeJSON(w, http.StatusUnprocessableEntity, form)
		return
	}

	id := app.sessionManager.GetInt(r.Context(), "authenticatedUserID")

	err = app.users.PasswordUpdate(id, form.Password, form.NewPassword)
	if err != nil {
		if errors.Is(err, models.ErrInvalidCredentials) {
			form.AddField("password", "Password is incorrect!")
			app.writeJSON(w, http.StatusUnprocessableEntity, form)
		} else {
			app.serverError(w, r, err)
		}
		return
	}

	app.writeJSON(w, http.StatusOK, map[string]string{"message": "password updated successfully"})
}

func (app *application) listUsers(w http.ResponseWriter, r *http.Request) {
    users, err := app.users.GetAll()
    if err != nil {
        app.serverError(w, r, err)
        return
    }
    app.writeJSON(w, http.StatusOK, users)
}