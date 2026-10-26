Config = {}

-- top-right | top-left | top-center | bottom-right | bottom-left | bottom-center | center-right | center-left
Config.Position        = 'top-right'
Config.MaxVisible      = 5        -- max notify in one moment
Config.DefaultDuration = 5500     -- ms
Config.ShowTimerBar    = true     -- under timer
Config.Sound           = true      
Config.Volume          = 0.12     -- 0.0 - 1.0
Config.TestCommand     = true     -- /phxnotify  

-- Predvolené nadpisy pre typy
Config.Titles = {
    success   = 'Success',
    error     = 'Error',
    info      = 'Information',
    warning   = 'Warning',
    police    = 'Police',
    ambulance = 'Ambulance',
    money     = 'Finances',
    ticket    = 'Report system',
}
