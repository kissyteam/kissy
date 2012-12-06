### xtemplate

Provide logic template engine for KISSY.

It consists three modules:

-   xtemplate - Both compiler and runtime functionality.
-   xtemplate/compiler - Compiler string template to module functions.
-   xtemplate/runtime -  Runtime for string template( with xtemplate/compiler loaded)
    or template functions.

xtemplate/compiler depends on xtemplate/runtime,
because compiler needs to know about runtime to generate corresponding codes.