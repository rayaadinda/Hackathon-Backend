// Performance monitoring middleware - Simple and reliable
export const performanceMonitor = (req, res, next) => {
	const start = Date.now()

	// Set the response time header immediately
	res.locals.startTime = start

	// Log completion when response finishes
	res.on("close", () => {
		const duration = Date.now() - start

		// Log slow requests (> 1 second)
		if (duration > 1000) {
			console.warn(`Slow request: ${req.method} ${req.url} - ${duration}ms`)
		} else if (process.env.NODE_ENV !== "production") {
			// Only log normal requests in development
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
