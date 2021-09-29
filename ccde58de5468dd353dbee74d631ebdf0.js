ace.define("ace/snippets/haml",["require","exports","module"],function(e,n,t){"use strict";n.snippetText=`snippet t
	%table
		%tr
			%th
				\${1:headers}
		%tr
			%td
				\${2:headers}
snippet ul
	%ul
		%li
			\${1:item}
		%li
snippet =rp
	= render :partial => '\${1:partial}'
snippet =rpl
	= render :partial => '\${1:partial}', :locals => {}
snippet =rpc
	= render :partial => '\${1:partial}', :collection => @$1

`,n.scope="haml"}),function(){ace.require(["ace/snippets/haml"],function(e){typeof module=="object"&&typeof exports=="object"&&module&&(module.exports=e)})}();
