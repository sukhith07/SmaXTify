    // ======================================
    // Convert Currency Using Live Exchange Rate
    // ======================================

    exports.convertCurrency = async (req, res) => {

    try {

        const {
        from,
        to,
        amount,
        } = req.query;


        // ======================================
        // Validation
        // ======================================

        if (!from || !to || !amount) {

        return res.status(400).json({

            success: false,

            message:
            "From currency, to currency and amount are required.",

        });

        }


        const numericAmount =
        Number(amount);


        if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
        ) {

        return res.status(400).json({

            success: false,

            message:
            "Amount must be a valid number greater than 0.",

        });

        }


        const baseCurrency =
        String(from).toUpperCase();

        const targetCurrency =
        String(to).toUpperCase();


        // ======================================
        // Same Currency
        // ======================================

        if (
        baseCurrency === targetCurrency
        ) {

        return res.status(200).json({

            success: true,

            from: baseCurrency,

            to: targetCurrency,

            amount: numericAmount,

            rate: 1,

            convertedAmount:
            numericAmount,

            date: new Date()
            .toISOString(),

        });

        }


        // ======================================
        // Frankfurter Live Rate
        // ======================================

        const response =
        await fetch(
            `https://api.frankfurter.dev/v2/rate/${baseCurrency}/${targetCurrency}`
        );


        const data =
        await response.json();


        // ======================================
        // API Error
        // ======================================

        if (!response.ok) {

        return res.status(
            response.status
        ).json({

            success: false,

            message:
            data.message ||
            "Unable to fetch exchange rate.",

        });

        }


        const rate =
        Number(data.rate);


        if (
        !Number.isFinite(rate)
        ) {

        return res.status(500).json({

            success: false,

            message:
            "Invalid exchange rate received.",

        });

        }


        // ======================================
        // Calculate Conversion
        // ======================================

        const convertedAmount =
        numericAmount * rate;


        // ======================================
        // Response
        // ======================================

        return res.status(200).json({

        success: true,

        from: baseCurrency,

        to: targetCurrency,

        amount: numericAmount,

        rate,

        convertedAmount,

        date:
            data.date || null,

        });

    } catch (error) {

        console.error(
        "Currency Conversion Error:",
        error
        );


        return res.status(500).json({

        success: false,

        message:
            "Failed to convert currency.",

        });

    }

    };