// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
	const start = Date.now()

	// Add response time header
	res.on("finish", () => {
		const duration = Date.now() - start
		res.set("X-Response-Time", `${duration}ms`)

		// Log slow requests (> 1 second)
		if (duration > 1000) {
			console.warn(`Slow request: ${req.method} ${req.url} - ${duration}ms`)
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
