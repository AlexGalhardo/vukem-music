// Command app runs vukem-music: the HTTP server by default, or a command such
// as migrate, route:list or about (vukem <command> delegates here).
package main

import (
	"fmt"
	"os"

	vukem "github.com/AlexGalhardo/vukem"

	"github.com/AlexGalhardo/vukem-music/bootstrap"
)

var (
	version = "dev"
	commit  = "unknown"
	date    = "unknown"
)

func main() {
	if len(os.Args) == 2 && (os.Args[1] == "--version" || os.Args[1] == "version") {
		fmt.Printf("vukem-music %s (commit %s, built %s)\n", version, commit, date)
		return
	}
	os.Exit(vukem.Main(bootstrap.New))
}
