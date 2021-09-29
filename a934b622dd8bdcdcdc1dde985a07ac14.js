ace.define("ace/snippets/rst",["require","exports","module"],function(n,e,t){"use strict";e.snippetText=`# rst

snippet :
	:\${1:field name}: \${2:field body}
snippet *
	*\${1:Emphasis}*
snippet **
	**\${1:Strong emphasis}**
snippet _
	\\\`\${1:hyperlink-name}\\\`_
	.. _\\\`$1\\\`: \${2:link-block}
snippet =
	\${1:Title}
	=====\${2:=}
	\${3}
snippet -
	\${1:Title}
	-----\${2:-}
	\${3}
snippet cont:
	.. contents::
	
`,e.scope="rst"}),function(){ace.require(["ace/snippets/rst"],function(n){typeof module=="object"&&typeof exports=="object"&&module&&(module.exports=n)})}();
