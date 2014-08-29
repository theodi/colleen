local rooturl = "http://quiet-cove-8120.herokuapp.com"
local minwait = 2
local maxwait = 50

http.page_start("Timeseries")
http.request_batch({
    {
        "GET",
        rooturl .. "/timeseries",
        headers = { ["Accept-Encoding"] = "gzip, deflate" }
    }
})
http.page_end("Timeseries")

client.sleep(math.random(minwait, maxwait))

http.page_start("Timeseries range")
http.request_batch({
    {
        "GET",
        rooturl .. "/timeseries/from/" .. os.time() - 180 .. "/to/" .. os.time() - 120,
        headers = { ["Accept-Encoding"] = "gzip, deflate" }
    }
})
http.page_end("Timeseries range")

client.sleep(math.random(minwait, maxwait))
