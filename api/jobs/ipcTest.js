'use strict';

const job = require('../parts/jobs/job.js'),
	  res = require('../parts/jobs/resource.js'),
	  log = require('../utils/log.js')('job:ipcTest');


class TestResource extends res.Resource {
	open () {
		this.a = 0;
		return new Promise((resolve) => {
			log.d('open');
			setTimeout(() => {
				this.opened();
				resolve();
			}, 2000);
		});
	}

	close () {
		return new Promise((resolve) => {
			log.d('close');
			setTimeout(() => {
				this.closed();
				resolve();
			}, 2000);
		});
	}

	checkActive () {
		return new Promise((resolve) => {
			log.d('checkActive');
			setTimeout(() => {
				resolve(this.a++ > 0 ? false : true);
			}, 2000);
		});
	}

}

class Test extends job.IPCJob {
	createResource () {
		return new TestResource();
	}

	divide () {
		return new Promise((resolve, reject) => {
			log.d('dividing ', this._json);

			setTimeout(() => {
				resolve([{smth: 1, size: 40}], [{smth: 1, size: 50}]);
			}, 500);
		});
	}

	run (db, done, progress) {
		log.d('running ', this._json);
		log.d('resource is ', typeof this.resource);
		log.d('resource is open? ', this.resource.isOpen);
		log.d('resource is active? ', this.resource.isAssigned);

		if (this.done < 10) {
			setTimeout(() => {
				progress(this._json.size, 10, 'ten');
			}, 1000);
		}

		if (this.done < 20) {
			setTimeout(() => {
				progress(this._json.size, 20, 'twenty');
				// a = b;
			}, 5000);
		}

		if (this.done < 30) {
			setTimeout(() => {
				progress(this._json.size, 30, 'thirty');
			}, 6000);
		}

		setTimeout(() => {
			progress(100, 100, 'sixty');
			done();
		}, 60000);

		setTimeout(() => {
			log.d('after done resource is ', typeof this.resource);
			done('Big fat error');
			db.collection('jobs').findOne({_id: this._json._id}, (err, obj) => {
				log.d('after done job findOne ', err, obj);
			});
		}, 120000);
	}
}

module.exports = Test;