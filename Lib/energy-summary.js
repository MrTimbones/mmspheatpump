/**Use the first and last readings to work out how much power we've used */
function kiloWattHoursUsed(kilowattHoursFeed) {
    return kilowattHoursFeed[kilowattHoursFeed.length - 1][1] - kilowattHoursFeed[0][1]
}

/**Describe the efficiency, cost and power consumption of these two feeds */
function energySummary(inputFeed, outputFeed, interval, hideEfficiency, hideConsumption) {

    const consumed = kiloWattHoursUsed(inputFeed)
    const produced = kiloWattHoursUsed(outputFeed)

    // Check we can perform the relevant maths
    if (consumed == 0) return ""

    content = ""
    if (!hideEfficiency) {
        content += Math.round(100 * produced / consumed);
        content += "%"
        if (!hideConsumption) {
            content += ", "
        }
    }

    if (!hideConsumption) {
        // Assumes currency is a prefix
        if (config.app["Currency"]) {
            content += config.app["Currency"].value;
        } else {
            content += "£";
        }

        let cost = 0.145
        if (config.app["UnitCost"]) {
            cost = parseFloat(config.app["UnitCost"].value)
        }
        content += (cost * consumed).toFixed(2)

        // When looking at large time windows the kWh can become very large, so don't use toPrecision
        content += " (kWh: "
        content += consumed.toFixed(1)
        content += " => "
        content += produced.toFixed(1)

        if (interval == 3600) {
            // No point showing the kW because it'll be the same as the kWh
            // We default the UI to one hour, so optimise for this specific case to keep the UI looking trim
        } else {
            content += ", kW: "
            content += (consumed * 3600 / interval).toPrecision(3)
            content += " => "
            content += (produced * 3600 / interval).toPrecision(3)
        }
        content += ")"
    }

    return content
}

async function updateWindowSummary(feedHistoryByConfigKey, windowTimeInterval) {

    $("[data-input-config-key][data-output-config-key]").each(function () {

        const inputConfigKey = $(this).attr("data-input-config-key")
        const inputDataSeries = feedHistoryByConfigKey[inputConfigKey]

        const outputConfigKey = $(this).attr("data-output-config-key")
        const outputDataSeries = feedHistoryByConfigKey[outputConfigKey]

        hideEfficiency = false
        if ($(this).attr("hideEfficiency") == 1) hideEfficiency = true

        hideConsumption = false
        if ($(this).attr("hideConsumption") == 1) hideConsumption = true

        if (inputDataSeries && outputDataSeries) {
            const summary = energySummary(inputDataSeries, outputDataSeries, windowTimeInterval, hideEfficiency, hideConsumption)
            $(this).text(summary)
        } else {
            // Not enough feeds configured for this summary
            $(this).text("")
        }

    })

}