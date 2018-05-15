'use strict';

import superagent from 'superagent';
import logger from '../lib/logger';
import { startServer, stopServer } from '../lib/server';
import { createPlantMock } from './lib/plant-mock';
import { createProfileMock, removeProfileMock } from './lib/profile-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('TESTING ROUTES At /plants', () => {
  beforeAll(startServer);
  afterEach(removeProfileMock);
  afterAll(stopServer);

  describe('POST /plants', () => {
    describe('POST 200 for successful post to /plants', () => {
      test('should return 200', () => {
        return createProfileMock()
          .then((responseMock) => {
            const { token } = responseMock.accountSetMock;
            console.log('TEST: token ', token);
            return superagent.post(`${apiURL}/plants`)
              .set('Authorization', `Bearer ${token}`)
              .send({
                commonName: 'Geranium',
                placement: 'indoors',
              })
              .then((response) => {
                expect(response.status).toEqual(200);
                expect(response.body._id).toBeTruthy();
                expect(response.body.commonName).toEqual('Geranium');
                expect(response.body.placement).toEqual('indoors');
              });
          })
          .catch((error) => {
            expect(error.status).toEqual(200);
          });
      });
    });

    test('POST /plants 400 status code for bad request', () => {
      return createProfileMock()
        .then((responseMock) => {
          const { token } = responseMock.accountSetMock;
          console.log('TEST: token ', token);
          return superagent.post(`${apiURL}/plants`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              placement: 'indoors',
            })
            .then(Promise.reject)
            .catch((err) => {
              expect(err.status).toEqual(400);
            });
        });
    });

    test('should return 401 when no token given', () => {
      return createPlantMock()
        .then(() => {
          return superagent.post(`${apiURL}/plants`)
            .set('Authorization', 'Bearer ')
            .send({
              placement: 'indoors',
            });
        })
        .then(Promise.reject)

        .catch((response) => { 
          expect(response.status).toEqual(401);
        });
    });
  });
  describe('GET 200 for successful get to /plants/:id', () => {
    test(' should return 200', () => {
      let plantTest = null;
      return createPlantMock()
        .then((plant) => {
          plantTest = plant;
          return superagent.get(`${apiURL}/plants/${plant.plant._id}`)
            .set('Authorization', `Bearer ${plantTest.accountMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.token).toBeTruthy();
        })
        .catch((err) => {
          logger.log(logger.ERROR, err);
        });
    });

    test('GET /plants should return a 400 status code for no id', () => {
      return createPlantMock()
        .then(() => {
          return superagent.post(`${apiURL}/plants/`);
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(400);
        });
    });

    test('GET /plants should return a 404 status code for missing token', () => {
      return createPlantMock()
        .then((plant) => {
          return superagent.post(`${apiURL}/pictures/${plant.plant._id}`)
            .set('Authorization', 'Bearer ');
        })
        .then(Promise.reject)
        .catch((err) => {
          expect(err.status).toEqual(404);
        });
    });
  });
  describe('DELETE', () => {
    test('DEL /plants/:id should respond with 204 if delete completed', () => {
      return createPlantMock()
        .then((plantMock) => {
          return superagent.delete(`${apiURL}/pictures/${plantMock.plant._id}`)
            .set('Authorization', `Bearer ${plantMock.accountMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(204);
        });
    });
    test('DEL /plants/:id should respond with 404 if no picture exists', () => {
      return superagent.delete(`${apiURL}/pictures/wrongId`)
        .then(Promise.reject)
        .catch((error) => {
          expect(error.status).toEqual(404);
        });
    });
    test('DEL /plants/:id should respond with 401 if bad token', () => {
      return createPlantMock()
        .then((plantMock) => {
          return superagent.delete(`${apiURL}/pictures/${plantMock.plant._id}`)
            .set('Authorization', 'Bearer ');
        })
        .then(Promise.reject)
        .catch((error) => {
          expect(error.status).toEqual(401);
        });
    });
  });
});
