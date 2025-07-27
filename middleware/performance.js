// Performance monitoring middleware - Serverless compatible
export const performanceMonitor = (req, res, next) => {
	// Skip performance monitoring in production to avoid header issues
	if (process.env.NODE_ENV === "production") {
		return next()
	}

	const start = Date.now()

	// Log completion when response finishes (development only)
	res.on("close", () => {
		const duration = Date.now() - start

		// Log slow requests (> 1 second)
		if (duration > 1000) {
			console.warn(`Slow request: ${req.method} ${req.url} - ${duration}ms`)
		} else {
			console.log(`${req.method} ${req.url} - ${duration}ms`)
		}
	})

	next()
}

// Cache control helper
export const setCacheHeaders = (maxAge = 300) => {
	return (req, res, next) => {
		res.set("Cache-Control", `public, max-age=${maxAge}`)
		next()
	}
}

// Response compression helper
export const setCompressionHeaders = (req, res, next) => {
	res.set("Vary", "Accept-Encoding")
	next()
}
