fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'phx_notify'
author 'PHX'
description 'PHX Notify - Modern Notify System (ESX / QBCore / QBox / Standalone)'
version '1.0.0'


provide 'esx_notify'

ui_page 'html/index.html'

shared_script 'config.lua'
client_script 'client/main.lua'
server_script 'server/main.lua'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js'
}
