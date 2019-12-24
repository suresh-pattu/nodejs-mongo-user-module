module.exports = {
    sendResponse: (res, status_code, data, msg) => {
        let _errStatus = false;
        let _errCodes = [400, 401, 403, 404, 500, 502, 503, 504];
        if (_errCodes.indexOf(status_code) !== -1) {
            _errStatus = true
        }
        res.status(status_code).send({error: _errStatus, data: data, msg: msg || ''});
    }
};