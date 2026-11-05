package routes

import (
	"net/http"

	vukem "github.com/AlexGalhardo/vukem"
	"github.com/AlexGalhardo/vukem/inertia"
	"github.com/AlexGalhardo/vukem/middleware"
	"github.com/AlexGalhardo/vukem/router"

	"github.com/AlexGalhardo/vukem-music/app/controllers"
	"github.com/AlexGalhardo/vukem-music/resources"
)

// Web registers the browser routes. vukem route:list shows them.
func Web(r *router.Router, app *vukem.App) error {
	if err := vukem.DefaultMiddleware(app, r); err != nil {
		return err
	}

	r.UseServer(middleware.Gzip()) // proxies in front of the app may not compress
	r.UseServer(middleware.StaticFS(resources.Public(), middleware.StaticConfig{Prefix: "/"}))
	r.Use(app.Inertia.Middleware, inertia.I18n("nav.", "ui."), shareProps(app))

	db, err := app.DB()
	if err != nil {
		return err
	}

	r.Get("/", controllers.Study(db, "overview")).Name("home")
	r.Get("/lessons", controllers.Study(db, "lessons")).Name("lessons")
	r.Get("/lessons/{lesson}", controllers.Study(db, "lesson")).Name("lesson")
	r.Get("/practice", controllers.Study(db, "practice")).Name("practice")
	r.Get("/progress", controllers.Study(db, "progress")).Name("progress")

	return nil
}

// shareProps adds the props every page receives (usePage().props).
func shareProps(app *vukem.App) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			inertia.Share(r.Context(), "appName", app.Config.Name)
			next.ServeHTTP(w, r)
		})
	}
}
