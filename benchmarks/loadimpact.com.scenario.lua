http.page_start("Timeseries")
http.request_batch({
    {"GET", "http://quiet-cove-8120.herokuapp.com/timeseries"},
})
http.page_end("Timeseries")

client.sleep(math.random(2000, 50000), 1000)

http.page_start("Timeseries range")
http.request_batch({
    {"GET", "http://quiet-cove-8120.herokuapp.com/timeseries/from/" .. os.time() - 180 .. "/to/" .. os.time() - 120},
})
http.page_end("Timeseries range")

client.sleep(math.random(2000, 50000), 1000)
