/**
	A Proxy to the slyd backend API.
*/
ASTool.SlydApi = Em.Object.extend({

	/**
	@public

	The name of the current project.
	*/
	project: null,

	projectSpecUrl: function() {
		return ASTool.SlydApi.getApiUrl() + '/' + this.project + '/spec/';
	}.property('project'),

	botUrl: function() {
		return ASTool.SlydApi.getApiUrl() + '/' + this.project + '/bot/';
	}.property('project'),


	/**
	@public

	Fetches project names.

	@method getProjectNames
	@for ASTool.SlydApi
	@return {Promise} a promise that fulfills with an {Array} of project names.
	*/
	getProjectNames: function() {
		var hash = {};
		hash.type = 'GET';
		hash.url = ASTool.SlydApi.getApiUrl();
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Creates a new project. A project with the same name must not exist or
	this operation will fail.
	Project names must only contain alphanum, '.'s and '_'s.

	@method createProject
	@for ASTool.SlydApi
	@param {String} [projectName] The name of the new project.
	@return {Promise} a promise that fulfills when the server responds.
	*/
	createProject: function(projectName) {
		var hash = {};
		hash.type = 'POST';
		hash.url = ASTool.SlydApi.getApiUrl();
		hash.data = JSON.stringify({ cmd: 'create', args: [projectName] });
		hash.dataType = 'text';
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Deletes an existing project.

	@method deleteProject
	@for ASTool.SlydApi
	@param {String} [projectName] The name of the project to delete.
	@return {Promise} a promise that fulfills when the server responds.
	*/
	deleteProject: function(projectName) {
		var hash = {};
		hash.type = 'POST';
		hash.url = ASTool.SlydApi.getApiUrl();
		hash.data = JSON.stringify({ cmd: 'rm', args: [projectName] });
		hash.dataType = 'text';
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Renames an existing project. This operation will not overwrite
	existing projects.
	Project names must only contain alphanum, '.'s and '_'s.

	@method renameProject
	@for ASTool.SlydApi
	@param {String} [oldProjectName] The name of the project to rename.
	@param {String} [newProjectName] The new name for the project.
	@return {Promise} a promise that fulfills when the server responds.
	*/
	renameProject: function(oldProjectName, newProjectName) {
		var hash = {};
		hash.type = 'POST';
		hash.url = ASTool.SlydApi.getApiUrl();
		hash.data = JSON.stringify({ cmd: 'mv', args: [oldProjectName, newProjectName] });
		hash.dataType = 'text';
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Returns a list with the spider names for the current project.

	@method getSpiderNames
	@for ASTool.SlydApi
	@return {Promise} a promise that fulfills with an {Array} of spider names.
	*/
	getSpiderNames: function() {
		var hash = {};
		hash.type = 'GET';
		hash.url = this.get('projectSpecUrl') + 'spiders';
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Fetches a spider.

	@method loadSpider
	@for ASTool.SlydApi
	@param {String} [spiderName] The name of the spider.
	@return {Promise} a promise that fulfills with a JSON {Object}
		containing the spider spec.
	*/
	loadSpider: function(spiderName) {
		var hash = {};
		hash.type = 'GET';
		hash.url = this.get('projectSpecUrl') + 'spiders/' + spiderName;
		return this.makeAjaxCall(hash).then(function(spiderData) {
			spiderData['name'] = spiderName;
			spiderData['templates'] = spiderData['templates'].map(function(template) {
				// Assign a name to templates. This is needed as Autoscraping templates
				// are not named.
				if (Em.isEmpty(template['name'])) {
					template['name'] = ASTool.shortGuid();
				}
				return ASTool.Template.create(template);
			});
			return ASTool.Spider.create(spiderData);
		});
	},

	/**
	@public

	Fetches a template.

	@method loadTemplate
	@for ASTool.SlydApi
	@param {String} [spiderName] The name of the spider.
	@param {String} [templateName] The name of the template.
	@return {Promise} a promise that fulfills with a JSON {Object}
		containing the template spec.
	*/
	loadTemplate: function(spiderName, templateName) {
		var hash = {};
		hash.type = 'GET';
		hash.url = this.get('projectSpecUrl') + 'spiders/' + spiderName + '/' + templateName;
		return this.makeAjaxCall(hash).then(function(templateData) {
			return ASTool.Template.create(templateData);
		});
	},

	/**
	@public

	Renames an existing spider. This operation will overwrite
	existing spiders.
	Spider names must only contain alphanum, '.'s and '_'s.

	@method renameSpider
	@for ASTool.SlydApi
	@param {String} [oldSpiderName] The name of the spider to rename.
	@param {String} [newSpiderName] The new name for the spider.
	@return {Promise} a promise that fulfills when the server responds.
	*/
	renameSpider: function(oldSpiderName, newSpiderName) {
		var hash = {};
		hash.type = 'POST';
		hash.url = this.get('projectSpecUrl') + 'spiders';
		hash.data = JSON.stringify({ cmd: 'mv', args: [oldSpiderName, newSpiderName] });
		hash.dataType = 'text';
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Renames an existing template. This operation will overwrite
	existing templates.
	Template names must only contain alphanum, '.'s and '_'s.

	@method renameTemplate
	@for ASTool.SlydApi
	@param {String} [spiderName] The name of the spider owning the template.
	@param {String} [oldTemplateName] The name of the template to rename.
	@param {String} [newTemplateName] The new name for the template.
	@return {Promise} a promise that fulfills when the server responds.
	*/
	renameTemplate: function(spiderName, oldTemplateName, newTemplateName) {
		var hash = {};
		hash.type = 'POST';
		hash.url = this.get('projectSpecUrl') + 'spiders';
		hash.data = JSON.stringify({ cmd: 'mvt', args: [spiderName, oldTemplateName, newTemplateName] });
		hash.dataType = 'text';
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Saves a spider for the current project.

	@method saveSpider
	@for ASTool.SlydApi
	@param {String} [spiderName] the name of the spider.
	@param {Object} [spiderData] a JSON object containing the spider spec.
	@param {Bool} [excludeTemplates] if true, don't save spider templates.
	@return {Promise} promise that fulfills when the server responds.
	*/
	saveSpider: function(spider, excludeTemplates) {
		var hash = {};
		hash.type = 'POST';
		var spiderName = spider.get('name');
		serialized = spider.serialize();
		if (excludeTemplates) {
			delete serialized['templates'];
		}
		hash.data = JSON.stringify(serialized);
		hash.dataType = 'text';
		hash.url = this.get('projectSpecUrl') + 'spiders/' + spiderName;
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Saves a spider template for the current project.

	@method saveTemplate
	@for ASTool.SlydApi
	@param {String} [spiderName] the name of the spider.
	@param {String} [templateName] the name of the template.
	@param {Object} [templateData] a JSON object containing the template spec.
	@return {Promise} promise that fulfills when the server responds.
	*/
	saveTemplate: function(spiderName, template) {
		var hash = {};
		hash.type = 'POST';
		var templateName = template.get('name');
		serialized = template.serialize();
		if (template.get('_new')) {
			serialized['original_body'] = template.get('original_body');
			template.set('_new', false);
		}
		hash.data = JSON.stringify(serialized);
		hash.dataType = 'text';
		hash.url = this.get('projectSpecUrl') + 'spiders/' + spiderName + '/' + templateName;
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Deletes an existing spider.

	@method deleteSpider
	@for ASTool.SlydApi
	@param {String} [spiderName] The name of the spider to delete.
	@return {Promise} a promise that fulfills when the server responds.
	*/
	deleteSpider: function(spiderName) {
		var hash = {};
		hash.type = 'POST';
		hash.dataType = 'text';
		hash.url = this.get('projectSpecUrl') + 'spiders';
		hash.data = JSON.stringify({ cmd: 'rm', args: [spiderName] });
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Deletes an existing template.

	@method deleteTemplate
	@for ASTool.SlydApi
	@param {String} [spiderName] The name of the spider that owns the template.
	@param {String} [spiderName] The name of the template to delete.
	@return {Promise} a promise that fulfills when the server responds.
	*/
	deleteTemplate: function(spiderName, templateName) {
		var hash = {};
		hash.type = 'POST';
		hash.dataType = 'text';
		hash.url = this.get('projectSpecUrl') + 'spiders';
		hash.data = JSON.stringify({ cmd: 'rmt', args: [spiderName, templateName] });
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Fetches the current project items.

	@method loadItems
	@for ASTool.SlydApi
	@return {Promise} a promise that fulfills with an {Array} of JSON {Object}
		containing the items spec.
	}
	*/
	loadItems: function() {
		var hash = {};
		hash.type = 'GET';
		hash.url = this.get('projectSpecUrl') + 'items';
		return this.makeAjaxCall(hash).then(function(items) {
			items = this.dictToList(items, ASTool.Item);
			items.forEach(function(item) {
				if (item.fields) {
					item.fields = this.dictToList(item.fields, ASTool.ItemField);
				}
			}.bind(this));
			return items;
		}.bind(this));
	},

	/**
	@public

	Saves the current project items.

	@method saveItems
	@for ASTool.SlydApi
	@param {Array} [items] an array of JSON {Object} containing the items
		spec.
	@return {Promise} a promise that fulfills when the server responds.
	*/
	saveItems: function(items) {
		items = items.map(function(item) {
			item = item.serialize();
			if (item.fields) {
				item.fields = this.listToDict(item.fields);
			}
			return item;
		}.bind(this));
		items = this.listToDict(items);
		var hash = {};
		hash.type = 'POST';
		hash.data = JSON.stringify(items);
		hash.dataType = 'text';
		hash.url = this.get('projectSpecUrl') + 'items';
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Fetches the current project extractors.

	@method loadExtractors
	@for ASTool.SlydApi
	@return {Promise} a promise that fulfills with an {Array} of JSON {Object}
		containing the extractors spec.
	*/
	loadExtractors: function() {
		var hash = {};
		hash.type = 'GET';
		hash.url = this.get('projectSpecUrl') + 'extractors';
		return this.makeAjaxCall(hash).then(function(extractors) {
				return this.dictToList(extractors, ASTool.Extractor);
			}.bind(this)
		);
	},

	/**
	@public

	Saves the current project extractors.

	@method saveExtractors
	@for ASTool.SlydApi
	@param {Array} [extractors] an array of JSON {Object} containing the
		extractors spec.
	@return {Promise} a promise that fulfills when the server responds.
	*/
	saveExtractors: function(extractors) {
		extractors = extractors.map(function(extractor) {
			return extractor.serialize();
		});
		extractors = this.listToDict(extractors);
		var hash = {};
		hash.type = 'POST';
		hash.data = JSON.stringify(extractors);
		hash.dataType = 'text';
		hash.url = this.get('projectSpecUrl') + 'extractors';
		return this.makeAjaxCall(hash);
	},

	editProject: function(project_name, revision) {
		if (!ASTool.get('serverCapabilities.version_control')) {
			// if the server does not support version control, do
			// nothing.
			return new Em.RSVP.Promise(function(resolve, reject) {
				resolve();
			});
		} else {
			revision = revision ? revision : 'master';
			var hash = {};
			hash.type = 'POST';
			hash.url = ASTool.SlydApi.getApiUrl();
			hash.data = JSON.stringify(
				{ cmd: 'edit', args: [project_name, revision] });
			hash.dataType = 'text';
			return this.makeAjaxCall(hash);
		}
	},

	projectRevisions: function(projectName) {
		var hash = {};
		hash.type = 'POST';
		hash.url = ASTool.SlydApi.getApiUrl();
		hash.data = JSON.stringify(
			{ cmd: 'revisions', args: [projectName] });
		return this.makeAjaxCall(hash);
	},

	conflictedFiles: function(projectName) {
		var hash = {};
		hash.type = 'POST';
		hash.url = ASTool.SlydApi.getApiUrl();
		hash.data = JSON.stringify(
			{ cmd: 'conflicts', args: [projectName] });
		return this.makeAjaxCall(hash);
	},

	changedFiles: function(projectName) {
		var hash = {};
		hash.type = 'POST';
		hash.url = ASTool.SlydApi.getApiUrl();
		hash.data = JSON.stringify(
			{ cmd: 'changes', args: [projectName] });
		return this.makeAjaxCall(hash);
	},

	publishProject: function(projectName, force) {
		var hash = {};
		hash.type = 'POST';
		hash.url = ASTool.SlydApi.getApiUrl();
		hash.data = JSON.stringify(
			{ cmd: 'publish', args: [projectName, !!force] });
		hash.dataType = 'text';
		return this.makeAjaxCall(hash);
	},

	deployProject: function(projectName) {
		var hash = {};
		hash.type = 'POST';
		hash.url = ASTool.SlydApi.getApiUrl();
		hash.data = JSON.stringify(
			{ cmd: 'deploy', args: [projectName] });
		return this.makeAjaxCall(hash);
	},

	discardChanges: function(projectName) {
		var hash = {};
		hash.type = 'POST';
		hash.url = ASTool.SlydApi.getApiUrl();
		hash.data = JSON.stringify(
			{ cmd: 'discard', args: [projectName] });
		hash.dataType = 'text';
		return this.makeAjaxCall(hash);
	},

	saveFile: function(projectName, fileName, contents) {
		var hash = {};
		hash.type = 'POST';
		hash.url = ASTool.SlydApi.getApiUrl();
		hash.data = JSON.stringify(
			{ cmd: 'save', args: [projectName, fileName, contents] });
		hash.dataType = 'text';
		return this.makeAjaxCall(hash);
	},

	/**
	@public

	Fetches a page using the given spider.

	@method fetchDocument
	@for ASTool.SlydApi
	@param {String} [pageUrl] the URL of the page to fetch.
	@param {String} [spiderName] the name of the spider to use.
	@param {String} [parentFp] the fingerprint of the parent page.
	@return {Promise} a promise that fulfills with an {Object} containing
		the document contents (page), the response data (response), the
		extracted items (items), the request fingerprint (fp), an error
		message (error) and the links that will be followed (links).
	*/
	fetchDocument: function(pageUrl, spiderName, parentFp) {
		var hash = {};
		hash.type = 'POST';
		hash.data = JSON.stringify({ spider: spiderName,
									 request: { url: pageUrl } });
		if (parentFp) {
			hash.data['parent_fp'] = parentFp;
		}
		hash.url = this.get('botUrl') + 'fetch';
		return this.makeAjaxCall(hash);
	},

	/**
	@private

	Transforms a list of the form:
		[ { name: 'obj1', x: 'a' }, { name: 'obj2', x: 'b' }]

	into an object of the form:
		{
			obj1:
				{ x: 'a' },
			obj2:
				{ x: 'b' }
		}

	@method listToDict
	@for ASTool.SlydApi
	@param {Array} [list] the array to trasnform.
	@return {Object} the result object.
	*/
	listToDict: function(list) {
		var dict = {};
		list.forEach(function(element) {
			// Don't modify the original object.
			element = Em.copy(element);
			var name = element['name'];
			delete element['name'];
			dict[name] = element;
		});
		return dict;
	},

	/**
	@private

	Transforms an object of the form:
		{
			obj1:
				{ x: 'a' },
			obj2:
				{ x: 'b' }
		}

	into a list of the form:
		[ { name: 'obj1', x: 'a' }, { name: 'obj2', x: 'b' }]

	@method listToDict
	@for ASTool.SlydApi
	@param {Array} [list] the array to trasnform.
	@return {Object} the result object.
	*/
	dictToList: function(dict, wrappingType) {
		var entries = [];
		var keys = Object.keys(dict);
		keys.forEach(function(key) {
			var entry = dict[key];
			entry['name'] = key;
			if (wrappingType) {
				entry = wrappingType.create(entry);
			}
			entries.pushObject(entry);
		});
		return entries;
	},

	makeAjaxCall: function(hash) {
		return ic.ajax(hash).catch(function(reason) {
			method = hash.type;
			title = 'Error processing ' + method + ' to ' + hash['url'];
			if (hash.data) {
				title += '\nwith data ' + hash.data;
			}
			msg = '\n The server returned ' + reason['textStatus'] + '(' + reason['errorThrown'] + ')' +
				 '\n' + reason['jqXHR'].responseText;
			err = new Error(msg);
			err.title = title;
			err.name = 'HTTPError';
			err.reason = reason;
			throw err;
		});
	},
});


ASTool.SlydApi.reopenClass ({

	getApiUrl: function() {
		return (SLYD_URL || window.location.protocol + '//' + window.location.host) + '/projects';
	},
});
