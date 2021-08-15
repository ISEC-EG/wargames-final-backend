const Mutex = require('async-mutex')
const mutex = new Mutex.Mutex() // creates a shared mutex instance

module.exports = {
    queue(cb) {
        return async function (req, res, next) {
            const release = await mutex.acquire() // acquires access to the critical path
            try {
                await cb(req, res, next);
            } catch (err) {
                return res.status(500).json({ message: 'Internal server error' })
            } finally {
                release() // completes the work on the critical path
            }
        };
    }

};
