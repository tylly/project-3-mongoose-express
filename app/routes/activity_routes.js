// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for activity
const Activity = require('../models/activity')

const Destination = require('../models/destination')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
const destination = require('../models/destination')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// // GET /examples
// router.get('/:id', requireToken, (req, res, next) => {
// 	Example.find()
// 		.then((examples) => {
// 			// `examples` will be an array of Mongoose documents
// 			// we want to convert each one to a POJO, so we use `.map` to
// 			// apply `.toObject` to each one
// 			return examples.map((example) => example.toObject())
// 		})
// 		// respond with status 200 and JSON of the examples
// 		.then((examples) => res.status(200).json({ examples: examples }))
// 		// if an error occurs, pass it to the handler
// 		.catch(next)
// })

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get('/:id/:activityId', requireToken, (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Activity.findById(req.params.id)
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "example" JSON
		.then((activity) => res.status(200).json({ activity: activity.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// POST -> create a toy
// POST /toys/<pet_id>
router.post('/activities/:id', removeBlanks, requireToken, (req, res, next) => {
    // get our toy from req.body
	const destinationId = req.params.id
    const activity = req.body.activity
    // get our pet's id from req.params.petId
    
    // find the pet
    Destination.findById(destinationId)
        .then(handle404)
        .then(destination => {
            console.log('this is the destination', destination)
            console.log('this is the activity', activity)
			requireOwnership(req, destination)
            // push the toy into the pet's toys array
            destination.activities.push(activity)

            // save the pet
            return destination.save()
            
        })
        // send the newly updated pet as json
        .then(destination => res.status(201).json({ destination: destination }))
        .catch(next)
})

router.patch('/activities/:destinationId/:activityId', requireToken, removeBlanks, (req, res, next) => {
    // get the toy and the pet ids saved to variables
    const destinationId = req.params.destinationId
    const activityId = req.params.activityId

    // find our pet
    Destination.findById(destinationId)
        .then(handle404)
        .then(destination => {
            // single out the toy (.id is a subdoc method to find something in an array of subdocs)
            const theActivity = destination.activities.id(activityId)
            // make sure the user sending the request is the owner
            requireOwnership(req, destination)
            // update the toy with a subdocument method
            theActivity.set(req.body.activity)
            // return the saved pet
            return destination.save()
        })
        .then(() => res.sendStatus(204))
        .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/activities/:destinationId/:activityId', requireToken, (req, res, next) => {
    // get the toy and the pet ids saved to variables
    const destinationId = req.params.destinationId
    const activityId = req.params.activityId
    // then we find the pet
    Destination.findById(destinationId)
        // handle a 404
        .then(handle404)
        // do stuff with the toy(in this case, delete it)
        .then(destination => {
            // we can get the subdoc the same way as update
            const theActivity = destination.activities.id(activityId)
            // require that the user deleting this toy is the pet's owner
            requireOwnership(req, destination)
            // call remove on the subdoc
            theActivity.remove()

            // return the saved pet
            return destination.save()
        })
        // send 204 no content status
        .then(() => res.sendStatus(204))
        // handle errors
        .catch(next)
})

module.exports = router
