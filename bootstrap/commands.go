package bootstrap

import (
	vukem "github.com/AlexGalhardo/vukem"
	"github.com/AlexGalhardo/vukem-music/app/commands"
)

func Commands() []vukem.Command { return []vukem.Command{commands.BackupCommand()} }
