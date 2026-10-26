local TypeMap = {
    primary = 'info', info = 'info', inform = 'info',
    success = 'success', error = 'error', warning = 'warning', warn = 'warning',
    police = 'police', ambulance = 'ambulance', money = 'money', ticket = 'ticket',
}

local function normType(t)
    return TypeMap[tostring(t or 'info'):lower()] or 'info'
end

local function uid()
    return ('phx_%s_%s'):format(GetGameTimer(), math.random(1000, 9999))
end

local function send(data)
    if type(data) ~= 'table' then return end
    data.type = normType(data.type)
    data.id = data.id or uid()
    if data.duration == nil then data.duration = Config.DefaultDuration end
    data.title = data.title or Config.Titles[data.type]
    data.message = tostring(data.message or '')
    SendNUIMessage({ action = 'notify', data = data })
    return data.id
end

local function sendConfig()
    SendNUIMessage({
        action = 'config',
        data = {
            position = Config.Position,
            max = Config.MaxVisible,
            sound = Config.Sound,
            volume = Config.Volume,
            timer = Config.ShowTimerBar,
        }
    })
end

RegisterNUICallback('ready', function(_, cb) sendConfig(); cb('ok') end)
AddEventHandler('onClientResourceStart', function(r) if r == GetCurrentResourceName() then sendConfig() end end)

-- ========== Exporty ==========
-- exports.phx_notify:Send({ type='success', title='Success', message='Saved', duration=4000, icon='money', progress=50, id='your_id' })
exports('Send', send)
exports('Update', function(id, data) data = data or {}; data.id = id; SendNUIMessage({ action = 'update', data = data }) end)
exports('Remove', function(id) SendNUIMessage({ action = 'remove', id = id }) end)
exports('Clear', function() SendNUIMessage({ action = 'clear' }) end)
exports('SetPosition', function(pos) Config.Position = pos; sendConfig() end)

-- ESX kompatibilita (esx_notify): Notify(type, length, message, title, position)
exports('Notify', function(ntype, length, message, title)
    return send({ type = ntype, duration = length, message = message, title = title })
end)

-- QBCore kompatibilita: QBCore.Functions.Notify(text, type, length)
exports('QBNotify', function(text, ntype, length)
    local title, msg
    if type(text) == 'table' then title, msg = text.caption, text.text else msg = text end
    return send({ type = ntype, duration = length, message = msg, title = title })
end)

-- ========== Eventy ==========
RegisterNetEvent('phx_notify:send', function(data) send(data) end)

-- ========== Test ==========
if Config.TestCommand then
    RegisterCommand('phxnotify', function()
        local list = {
            { 'success',   'The payment went through successfully. You have **+$2,500** in your account.' },
            { 'error',     'You dont have enough money for this event.' },
            { 'info',      'The server will restart in **15 minutes**. Finish up any work you have in progress.' },
            { 'warning',   'Your vehicle has engine damage.' },
            { 'police',    'Report: **bank robbery** on Vinewood Blvd.' },
            { 'ambulance', 'An injured person needs help near Legion Square.' },
            { 'money',     'Payment: **$1,200** has been credited.' },
        }
        for _, n in ipairs(list) do
            send({ type = n[1], message = n[2] })
            Wait(450)
        end
        local id = send({ type = 'info', title = 'Im downloading data', message = 'Synchronizing profile…', duration = 0, progress = 0 })
        for p = 10, 100, 10 do
            Wait(250)
            SendNUIMessage({ action = 'update', data = { id = id, progress = p } })
        end
        SendNUIMessage({ action = 'update', data = { id = id, type = 'success', title = 'Done', message = 'The profile is synchronized.', duration = 3500, progress = 100 } })
    end, false)
end
