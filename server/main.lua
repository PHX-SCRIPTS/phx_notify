-- exports.phx_notify:Send(source, { type='success', title='..', message='..', duration=5000 })
exports('Send', function(src, data)
    TriggerClientEvent('phx_notify:send', src, data)
end)

-- exports.phx_notify:SendAll({ ... })
exports('SendAll', function(data)
    TriggerClientEvent('phx_notify:send', -1, data)
end)
