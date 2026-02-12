const Joi = require('joi');
const locationRepositories = require('../modules/predefined_data/repositories/locationRepositories');

class LocationController {
    

    async addLocation(req, res) {
        try {
            const locationValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Location name is required.',
                    'any.required': 'Location name is required.'
                })
            })

            const { error, value } = locationValidation.validate(req.body, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { name } = value;

            const normalizedName = name.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '');

            const isPresent = await locationRepositories.findLocationByNormalizedName(normalizedName);
            if (isPresent) {
                return res.status(400).json({
                    status: false,
                    errors: { name: 'Location name is already present.' }
                });
            }

            const newLocation = await locationRepositories.addLocation({ name, normalized: normalizedName });

            return res.status(201).json({
                status: true,
                message: 'Location name is saved.',
                data: newLocation
            });


        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getAllLocations(req, res) {
        try {
            const locations = await locationRepositories.getAllLocations();

            console.log(locations);
            return res.status(200).json({
                status: true,
                message: 'Locations fetched successfully.',
                data: locations
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async getLocation(req, res) {
        try {
            const location = await locationRepositories.getLocationById(req.params.id);
            if (!location) {
                return res.status(404).json({
                    status: false,
                    message: 'Location is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Location has been fetched successfully.',
                data: location
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async updateLocation(req, res) {
        try {
            const locationValidation = Joi.object({
                name: Joi.string().trim().required().messages({
                    'string.empty': 'Location name is required.',
                    'any.required': 'Location name is required.'
                })
            })

            const { error, value } = locationValidation.validate(req.body, { abortEarly: false });
            if (error) {
                console.log(error);
                const errors = {};
                error.details.forEach(err => {
                    errors[err.path[0]] = err.message;
                });
                return res.status(400).json({
                    status: false,
                    errors
                });
            }

            const { name } = value;

            const normalizedName = name.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '');

            const updatedLocation = await locationRepositories.updateLocation(req.params.id, { name, normalized: normalizedName });
            if (!updatedLocation) {
                return res.status(404).json({
                    status: false,
                    message: 'Location is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Location has been updated successfully.'
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async deleteLocation(req, res) {
        try {

            const locationId = req.params.id;

            const isLocationUsed = await locationRepositories.isLocationUsed(locationId);
            if (isLocationUsed) {
                return res.status(400).json({
                    status: false,
                    message: 'Location is in use and can not be deleted.'
                })
            }

            const deletedLocation = await locationRepositories.deleteLocation(locationId);
            if (!deletedLocation) {
                return res.status(404).json({
                    status: false,
                    message: 'Location is not found.'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Location has been deleted successfully.'
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }

    async searchLocation(req, res) {
        try {
            const { q } = req.query;
            const normalizedQuery = q.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '');

            const locations = await locationRepositories.searchLoationByNormalizedName(normalizedQuery);
            // console.log(skills);
            return res.status(200).json({
                status: true,
                message: 'Locations has been fetched successfully.',
                locations
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: 'Something went wrong. Please try again later.'
            });
        }
    }


}

module.exports = new LocationController();