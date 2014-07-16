#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , monocle = require('monocle')()
  , program = require('commander')
  , basename = path.basename
  , dirname = path.dirname
  , exists = fs.existsSync || path.existsSync
  , join = path.join
  , resolve = path.resolve
  , Redmine = require('../');

/**
 * Functions.
 */

function config(configValue) {

  var arrConfig = configValue.split(':'),
      key = arrConfig[0],
      value = arrConfig[1],
      flag = false;

  switch (key){
    case "domain":
    case "port":
    case "apikey":
    case "contenttype":
    case "language":
      flag = true;
    break;
    default:
    flag = false;
    break;
  }

  if (value === undefined || value === " " || value === "") {
    console.log("Please enter a valid configuration(Ej. domain:yourdomain.com) without whitespaces.");
    process.exit();
  }

  if (flag) {
    var configuration = new Redmine.FileManager(Redmine.configFile);
    configuration.set(key, value);
    configuration.save();

    if (configuration.get("language") === "en") {
      console.log("Set correctly {" + key + " : " + configuration.get(key) + "}");      
    }else{
      console.log("Se estableció correctamente {" + key + " : " + configuration.get(key) + "}");      
    };
  }else{
    if (configuration.get("language") === "en") {
      console.log("Please enter a valid configuration value(domain, port, apikey, contenttype, language).");
    }else{
      console.log("Por favor ingrese una configuración válida(domain, port, apikey, contenttype, language).");
    }
  };
  process.exit();
};

// redmine-issues options

var options = {};


program
  .version(require('../package.json').version)
  .usage('[options] <file ...>')
  .option('-c, --config <key>:<value>', 'Configuration options', config)
  .option('-i, --issue <issue>', 'issue id')
  .option('-p, --percent <percent>', 'percent of progress')
  .option('-m, --message <message>', 'your message or note')
  .option('-e, --estimated <estimated>', 'estimated hours')
  .option('-l, --list', 'list of issues');
  //.option('-s, --spent <spent>', 'spent hours');

program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    # configure your domain');
  console.log('    $ redmine --config domain:yourdomain.com');
  console.log('');
  console.log('    # configure your port');
  console.log('    $ redmine --config port:80');
  console.log('');
  console.log('    # configure your apikey');
  console.log('    $ redmine --config apikey:here_your_api_key');
  console.log('');
  console.log('    # configure your content type');
  console.log('    $ redmine --config domain:application/json');

  console.log('');
});

program.parse(process.argv);


/*
* Program options
*/

options.issue = program.issue || 0;
options.percent = program.percent || 0;
options.message = program.message || "";
options.estimated = program.estimated || 0;

options.list = program.list || false;
//options.spent = program.spent || 0;


/*
* Functions
*/

/*
* Function issues
*/

function issues(){
  var api = new Redmine.Api();
  api.getIssue(options.issue, function(){
    var issue = api.dataObject.issue;
    api.updateIssue(options.percent, options.message, options.estimated);
  });
}

/*
* Function issuesList
*/

function issuesList(){
  var api = new Redmine.Api();
  api.getIssues(options.list, function(response){

    var totalCount = response.total_count;
    var offset = response.offset;
    var limit = response.limit;
    var issues = response.issues;
    
    console.log('- - - - -');
    console.log('Summary');
    console.log('- - - - -');

    console.log('totalCount: ', totalCount);
    console.log('offset: ', offset);
    console.log('limit: ', limit);

    console.log('- - - - -');
    
    for (var i = 0; i < issues.length; i++) {
      
      console.log('Proyecto: ' + issues[i].project.name);
      if (issues[i].parent!==undefined) {
        console.log('Tarea Padre: ' + issues[i].parent.id);        
      };
      console.log('ID: ' + issues[i].id);
      console.log('Asunto: ' + issues[i].subject);
      console.log('Tipo: ' + issues[i].tracker.name);
      console.log('Estado: ' + issues[i].status.name);
      console.log('Prioridad: ' + issues[i].priority.name);
      console.log('Autor: ' + issues[i].author.name);
      console.log('Asignado a: ' + issues[i].assigned_to.name);
      console.log('Progreso: ' + issues[i].done_ratio+"%");
      console.log('Fecha de inicio: ' + issues[i].start_date);

      if (issues[i].due_date!==undefined) {
        console.log('Fecha fin: ' + issues[i].due_date);
      }
      console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
    };
  });
}


/*
* Run Functions
*/

if (program.percent!==0) {
  issues();
}else{
  if (options.message!=="") {
    issues();
  };
};

if (options.list) {
  issuesList();
};