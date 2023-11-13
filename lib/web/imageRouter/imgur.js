'use strict'
const config = require('../../config')
const logger = require('../../logger')
const fs = require('fs')
const fetch = require('node-fetch')
const { ImgurClient } = require('imgur');

exports.uploadImage = function (imagePath, callback) {
    if (!callback || typeof callback !== 'function') {
        logger.error('Callback has to be a function')
        return
    }

    if (!imagePath || typeof imagePath !== 'string') {
        callback(new Error('Image path is missing or wrong'), null)
        return
    }

    // The following client ID is for use with HedgeDoc only
    const clientId = config.imgur.clientID || '032aa2f687790cd'

    const buffer = fs.readFileSync(imagePath)

    const params = new URLSearchParams()
    params.append('image', buffer.toString('base64'))
    params.append('type', 'base64')

    if (config.imgur.clientSecret) {
        /*const client = new ImgurClient({
            clientId: config.imgur.clientID,
            clientSecret: config.imgur.clientSecret,
            refreshToken: config.imgur.refreshToken,
        });
        */
        const client = new ImgurClient({ accessToken: 'a70f78f01a7e2fd544193914efa3c559e2c3a057' });
        console.log("here")
        client.upload({
            image: params.get('image'),
            type: 'base64'
        })
            .then((res) => {
                console.log(res);
                if (!res.ok) {
                    callback(new Error(res.statusText), null)
                    return
                }
                return res.json()
            })
            .then((json) => {
                logger.info(`SERVER uploadimage success: ${JSON.stringify(json)}`)
                callback(null, json.data.link.replace(/^http:\/\//i, 'https://'))
            }).catch((err) => {
                console.log(err)
                callback(new Error(err), null)
            })
    } else {

        fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            body: params,
            headers: { Authorization: `Client-ID ${clientId}` }
        })
            .then((res) => {
                if (!res.ok) {
                    callback(new Error(res.statusText), null)
                    return
                }
                return res.json()
            })
            .then((json) => {
                logger.debug(`SERVER uploadimage success: ${JSON.stringify(json)}`)
                callback(null, json.data.link.replace(/^http:\/\//i, 'https://'))
            }).catch((err) => {
                callback(new Error(err), null)
            })
    }

}
