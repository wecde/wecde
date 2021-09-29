ace.define("ace/snippets/velocity",["require","exports","module"],function(n,e,t){"use strict";e.snippetText=`# macro
snippet #macro
	#macro ( \${1:macroName} \${2:\\$var1, [\\$var2, ...]} )
		\${3:## macro code}
	#end
# foreach
snippet #foreach
	#foreach ( \${1:\\$item} in \${2:\\$collection} )
		\${3:## foreach code}
	#end
# if
snippet #if
	#if ( \${1:true} )
		\${0}
	#end
# if ... else
snippet #ife
	#if ( \${1:true} )
		\${2}
	#else
		\${0}
	#end
#import
snippet #import
	#import ( "\${1:path/to/velocity/format}" )
# set
snippet #set
	#set ( $\${1:var} = \${0} )
`,e.scope="velocity",e.includeScopes=["html","javascript","css"]}),function(){ace.require(["ace/snippets/velocity"],function(n){typeof module=="object"&&typeof exports=="object"&&module&&(module.exports=n)})}();
