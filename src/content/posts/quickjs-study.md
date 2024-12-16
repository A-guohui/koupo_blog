---
title: 神秘的quickjs
date: 2023-06-26T14:26:00+08:00
tags:
  - quickjs
  - javascript
---

## 1. quickjs 介绍
quickjs是一个轻量级的JavaScript引擎，是由Fabrice Bellard个人开发，说这个可能大家不太清楚他是谁，但是大家肯定都知道FFMpeg这个支撑起了当前短视频的开源技术。而FFMpeg也是由Fabrice Bellard早些年开发出来的。

首先简单介绍下quickjs的特点：
- 支持ES2019标准，具有高性能和低内存占用的特点。
- quickjs可以嵌入到C/C++应用程序中，也可以作为独立的解释器使用。

使用以及扩展：
 - quickjs提供了一个命令行工具，可以用于执行JavaScript代码和调试。
  - quickjs支持一些扩展功能，如BigInt、RegExp、JSON、Promise等。

quickjs解释执行JS文件的 整体流程 可分为 **启动、解释、执行** 三个主要阶段，
中间穿插着一个**补充** 阶段，会根据JS代码的读取内容动态增加一些额外的功能和扩展。

简单了解下quickjs，就来到了本文的重点了！！！
对quickjs如何解释并执行一个最简单的JS文件进行详细的解释。
希望大家能从中领悟到quickjs这一高性能的JavaScript引擎的神秘之处。

```javascript

  hello.js文件
  // 解析例子
  console.log('Hello World');

```
## 2. quickjs 启动
在执行 hello.js 文件时，首先会进入 qjs.c（main函数文件） 的 main 函数，整个main函数负责读取 js 解释并执行。在 main 函数中，QuickJS 使用 eval_file 来执行脚本或者模块源代码，这是整个过程的入口，而再执行_JS_EvalInternal之前都是环境的初始化工作（包括上下文、运行时等初始化），函数整体调用链为：

<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/ad6b1eba-0f8d-47f6-84f1-7a76bad5a47dimage.png" alt="图1" />
</div>
<div style="text-align: center;">
【图1】函数调用链
</div>

下面我们从 eval_file 开始来看一下QuickJS具体是怎么执行 js 的。
### 2.1 eval_file JS读取执行入口
```javascript
  eval_file(ctx, filename, module)
```
eval_file 方法接收当前执行上下文 ctx 、js 文件路径 filename 以及 module 作为参数。进入该方法后，首先会通过 js_load_file 方法读取 js 文件，将内容保存在 buf 变量中；之后将上下文 ctx 及文件相关内容传入 eval_buf 方法去执行 js 代码，最后调用 js_free释放相关内存。主要流程如下图所示：

<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/3789aaf9-58f1-4857-b3e0-a999ccaa30ccimage.png" alt="图2" />
</div>
<div style="text-align: center;">
【图2】eval_file 执行流程图
</div>


### 2.2 eval_buf 解释执行js
接下来看一下 eval_buf，eval_buf 负责对读取到的 js 内容进行解释和执行。
eval_buf参数： 执行收上下文、js 字符串（'console.log('hello world')'）、js 字符串长度、js 文件路径、eval_flags 作为参数。
进入 eval_buf 函数后，首先会根据 eval_flags 区分代码是否是 module（模块代码），我们的代码不是 module 类型，会调用 JS_Eval 方法执行 JS 文件。

<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/e71d5019-8594-4994-a029-2e3f4511b9e0image.png" alt="图3" />
</div>
<div style="text-align: center;">
【图3】eval_buf 执行流程图
</div>


#### 2.2.1 JS_Eval、JS_EvalThis、JS_EvalInternal
JS_Eval 中只有一句代码，调用 JS_EvalThis 方法并返回执行结果，在调用时传入了全局对象 ctx->global_obj；
JS_EvalThis 方法中首先执行一条断言，判断代码是否是 global 或者 module 类型，是的话才会继续向下执行，调用JS_EvalInternal 方法，调用时传入 scope_idx = -1，并返回执行结果；
JS_EvalInternal 方法中首先执判断输入字符串是否可执行，不可执行抛出异常，否则执行 ctx->eval_internal(ctx, this_obj, input, input_len, filename, flags, scope_idx)。在初始化上下文时 JS_AddIntrinsicEval 将 内部 eval_internal 被设置为 __JS_EvalInternal，因此实际起作用的是 **__JS_EvalInternal**。


<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/5ca97d07-4c5f-49ed-a785-d14871da778cimage.png" alt="图4" />
</div>
<div style="text-align: center;">
【图4】JS_Eval &  JS_EvalThis & JS_EvalInternal
</div>

#### 2.2.2 __JS_EvalInternal
**_JS_EvalInternal** 是 QuickJs 解释并执行 js 代码的核心，如上图所示，该函数主要执行内容如下：
- 进入 __JS_EvalInternal 函数之后首先会声明一系列变量，比如解析状态JSParseState s、函数对象 fun_obj、返回值 ret_val、环境变量指针 var_refs、函数 fd等；
 ```javascript
  // 设置初始化 s，解析相关数据
  js_parse_init(ctx, s, input, input_len, filename); 
  // 过滤 Shebang，QuickJS 里无法使用
  skip_shebang(s); 

```
- 定义之后通过 js_parse_init 对 s 进行初始化，包括上下文、js文件路径，当前开始解析字符串开始位置、结束位置等；
- 初始化之后会调用 skip_shebang 过滤 Shebang，Shebang 一般是会在类 Unix 脚本的第一行，用来告诉系统希望用什么解释器执行脚本，比如#!/bin/bash 表示希望用 bash 来执行脚本。这些在 QuickJS 中 是没有用的；
 ```javascript

  fd = js_new_function_def(ctx, NULL, TRUE, FALSE, filename, 1);

```
- 接下来会执行 js_new_function_def 创建一个顶层的函数定义来初始化函数 fd，并初始化该函数，将其赋值给 s 的当前函数 cur_func，后续 js_create_function 函数会从函数定义中创建函数对象实例和子函数。
```javascript

  // 将一个新的作用域对象压入作用域链中
  push_scope(s); 
  // 设置body_scope 为当前词法作用域
  fd->body_scope = fd->scope_level; 
	
  // 解析函数生成字节码，保存在 fd->byte_code 里
  err = js_parse_program(s); 

```
- 对 s 和 fd 中的变量做完一系列处理之后就正式进入解析过程了，首先通过 push_scope 将 s 压入当前环境的作用域链顶层；
- 然后调用 js_parse_program 进行解析生成字节码，并保存在当前函数的 byte_code 字段中；
```javascript

  // 调用 js_create_function(...) 生成函数对象实例及包含的子函数，同时优化字节码
  fun_obj = js_create_function(ctx, fd); 

```
- 解析之后会调用 js_create_function 创建函数对象及其子函数实例，同时进行字节码优化；
```javascript

  // 执行字节码
  ret_val = JS_EvalFunctionInternal(ctx, fun_obj, this_obj, var_refs, sf); 

```

- 最后，调用 JS_EvalFunctionInternal 去执行字节码。

以上就是，QuickJS 引擎对 js 文件的读取、解析到执行的整个过程，下面会详细介绍一下字节码解析和执行过程。

## 3. quickjs 解释
js_parse_program函数是quickjs对js代码进行解析生成字节码的重要函数，会将JavaScript程序从字符串解析为相应的JSParseState抽象语法树（AST）结构。

js代码解析主要流程图


<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/6a7e2df6-702a-4abe-b454-dd3e2ff4fa01image.png" alt="图5" />
</div>
<div style="text-align: center;">
【图5】代码解析流程
</div>


示例涉及上述流程图中主要变量及主要函数如下:
```javascript

  JSParseState  // 是抽象语法树，用于存储js解析后的string，生成的字节码，及当前解析的主要信息。
  next_token   // 从输入流中读取下一个Token, 会根据不同的Token类型调用不同的子函数来解析它们
              （一个代码块在js_parse_program主函数中只会调用一次），剩余代码读取是在js_parse_source_element函数中调用的。
  js_parse_source_element  //解析JavaScript源代码中的单个语法元素（语句）。
  emit_op/emit_u16...  //emit系列函数为JSParseState的事件监听器，生成字节码，写入指定缓冲区。

```

流程图中其他逻辑介绍如下:
```javascript

  js_parse_directives  // 函数用于解析文件中的指令---------解析"use strict"等指令
  add_var  // 新建变量函数，返回相关索引
  return 0 // 代表无异常返回，在调用js_parse_program解析js代码的时候，会根据函数返回是否为0来判断是否需要抛出异常，释放内存

```

### 3.1 相关逻辑详解
**JSParseState抽象语法树（上述流程图中的 s）的重要属性**
```javascript

   JSContext *ctx：// 上下文
   last_line_num：// 当前正在处理的代码块的最后一行的行号
   line_num：// 表示当前正在处理的代码所在的行号
   JSToken token: // 当前识别到的token
   *last_ptr: // 上一次解析的字符串结束位置
   *buf_ptr: // 当前开始解析的字符串开始位置
   *buf_end: // 字符串结束位置
   *cur_func: // 存储解析生成的字节码

```

### 3.2 next_token函数详解
#### 3.2.1 next_token函数流程图


<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/cac2e6e7-a800-4bc9-bc29-e93e2f836eb0image.png" alt="图6" />
</div>
<div style="text-align: center;">
【图6】next_token 流程图
</div>


#### 3.2.2 next_token描述
- 在next_token函数中会根据2.1中抽象树中的那些指针拿到当前读取位置，然后拿到当前读取位置的字符，进行判断，包括一些特殊字符等，对应js中的各种情况。我们的例子中第一次执行该函数匹配到的就是字符串类型，此时会解析出console为标识符类型，并将其暂存在语法树的token变量中。
- parse_ident: 识别到标识符，通过JSAtom来完成对字符串的存储和比较，返回atom变量（JSAtom相关的可以看下文）
s->token: 存储识别到的token

### 3.3 js_parse_source_element函数详解 
首先，在执行js_parse_source_element函数时，我们已经执行过一次next_token，取出了第一个标识符，将其详细信息暂存在语法树s的token中，下面让我们来看看我们的例子在js_parse_source_element的执行过程。


<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/52f1125f-ee5a-430a-a67d-b812c05f5797image.png" alt="图7" />
</div>
<div style="text-align: center;">
【图7】js_parse_source_element调用链
</div>


js_parse_source_element调用链重要节点函数解释：
```javascript

  js_parse_expr  // 解析表达式入口函数
  js_parse_assign_expr2  // 解析赋值表达式
  js_parse_cond_expr  // 解析条件表达式
  js_parse_coalesce_expr  // 解析控制合并表达式
  js_parse_logical_and_or  // 解析逻辑与或表达式
  js_parse_expr_binary // 解析二元表达式
  js_parse_unary  // 解析一元表达式
  js_parse_postfix_expr  // 解析后缀表达式

```
我们通过上面的next_token读取到我们的当前读取token是一个标识符，此时也就代表和当前token相关的解析是表达式相关的，我们需要从最复杂的表达式一步一步解析去将它分解成最简单的表达式去存入抽象树的cur_func变量中（解析一个存入一个，这是一个存入栈的过程）。
在解析二元表达式的函数时，我们看到了一个关键变量leavel，它是一个常量，赋值为8，这个是代表二元表达式的8种情况，比如加减乘除，逻辑与或等，每一个语句都需要去调用switch去判断是否符合某一个二元表达式，所以我们的js_parse_expr_binary函数**调用了8次**，
我们的例子console.log()其实是最简单的后缀表达式。从最开始的js_parse_expr解析表达式入口函数，一步步进入最里层的js_parse_postfix_expr解析后缀表达式，最后产出一个token的栈以供后续执行代码使用。
下面就是我们解析的函数及token入栈出栈的详细图解：

<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/dde07bab-75b0-4db9-8989-38662fae7943image.png" alt="图8" />
</div>
<div style="text-align: center;">
【图8】js_parse_source_element函数调用栈
</div>

在调用js_parse_source_element过程中会将相应的操作指令和变量存储：

<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/d35bec16-8b70-484d-a4dd-5ed3c7854fe9image.png" alt="图9" />
</div>
<div style="text-align: center;">
【图9】指令存储栈
</div>


### 3.4 JS_EvalFunctionInternal
```javascript

  JS_EvalFunctionInternal(ctx, fun_obj,this_obj, **var_refs, *sf)                                   
  {
   
      fun_obj = js_closure(ctx, fun_obj, var_refs, sf);
      ret_val = JS_CallFree(ctx, fun_obj, this_obj, 0, NULL);

      return ret_val;
  }

```
这里简单理解就两个阶段：
1.   通过 js_closure() 函数创建一个闭包对象（初始化的一个操作），
2.   通过JS_CallFree()函数调用该闭包对象，然后返回调用结果。 
最终函数会返回执行结果。
### 3.5 JS_CallFree
```javascript

	 
 JS_CallFree(*ctx,func_obj,this_obj,argc, *argv)                 
  {
      JSValue res = JS_CallInternal(ctx, func_obj, this_obj, JS_UNDEFINED,
                                  argc, argv, JS_CALL_FLAG_COPY_ARGV);
      JS_FreeValue(ctx, func_obj);
      return res;
  }

```
在 JS_CallFree 中我们可以看到：
1. 这里调用了 JS_CallInternal 函数去执行得到返回结果。这里会将 JS_CALL_FLAG_COPY_ARGV 作为参数传递给 JS_CallInternal() 函数表示参数数组需要被复制。
2. 调用 JS_FreeValue()方法来释放 func_obj。

### 3.6 JS_CallInternal （第一次）
**JS_CallInternal  的调用是一个递归的过程，因为函数是嵌套的，每个函数都有一个tag属性，只要tag值是JS_CLASS_BYTECODE_FUNCTION就会继续调用JS_CallInternal。**
首先在执行这个函数之前，我们会从前面的步骤（解析token结束后）中得到一个指令栈，而这个指令栈的具体结构如图：


<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/1cbd2663-3068-4f36-b6d0-a17a0b9721bfimage.png" alt="图10" />
</div>
<div style="text-align: center;">
【图10】指令栈
</div>


我们的这个 JS_CallInternal  主要的工作流程就是遍历我们的指令栈，然后去执行相应的操作，简单的流程图可以理解为如下：（注 ：pc是一个指针，初始化时将pc指向指令栈的第一个字节）。


<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/a7db1577-d92c-4870-9ffb-a402707f1372image.png" alt="图11" />
</div>
<div style="text-align: center;">
【图11】指令执行流程
</div>


简单理解完执行流程后，下面我们逐步分析我们的js代码具体是如何执行的。
1. 首先我们介绍下函数入参
```javascript

  JS_CallInternal( *caller_ctx, func_obj, this_obj, new_target, argc, *argv, flags )
                                                              
  参数含义：1、当前执行上下文 2、当前执行函数 3、函数指向的this 4、es6中的target 5、参数个数 6、参数地址        。                                                

```
2. 初始化，初始化的过程会用到对应的入参去分配内存
- 首先会从func_obj中拿到function_bytecode（function_bytecode是一个结构体，tag标记为JS_CLASS_BYTECODE_FUNCTION）。
- 分配stack_buf空间，存储执行的值。
- 将pc指向指令栈的第一个字节。
- 其他初始化操作。
3. 接下来会进入一个无限循环，循环中会遍历0指令栈。执行对应操作。以下就是遍历指令的流程：（注： 指令栈中存储的字符串并不是常规意义上的字符串，而是将字符串转化为JSAtom类型后存储，所以占四个字节）
```javascript

  switch(pc){
     case(OP_get_var): {
          从pc取出'console'，pc后移4个字节；
          调用JS_GetGlobalVar得到console对象，赋值给val；
          将val压入stack_buf栈，栈后移一位；
         }
      }
      BREAK;

```
```javascript

  switch(pc){
     case(OP_get_field2): {
          从pc取出'log'，pc后移4个字节；
          调用JS_GetProperty(ctx, stack_buf[-1],'log')得到console对象，赋值给val；
          将val压入stack_buf栈，栈后移一位
         }
      }
      BREAK;
```
```javascript

  switch(pc){
     case(OP_push_atom_value): {
          从pc取出'hello world'（默认存储为atom），pc后移4个字节；
          调用JS_AtomToValue将atom类型转为JS_value类型，赋值给val；
          将val压入stack_buf栈，栈后移一位；
         }
      }
      BREAK;

```
```javascript

  switch(pc){
     case(OP_tail_call_method): {
              从pc取出参数个数，pc后移2个字节；
              根据参数个数计算出stack_buf中参数的位置;
              记录当前执行的指令位置到栈帧；
              继续调用JS_CallInternal(ctx, call_argv[-1], call_argv[-2],
                                              JS_UNDEFINED, call_argc, call_argv, 0)；
              此时参数值fun_obj位置是log, this_obj位置是console,new_target位置是JS_UNDEFINED,参数个数是                                             			 
              1，参数的值'hello world';
             }
          }
          BREAK;

```
这里会拿到函数参数个数，函数参数，继续调用JS_CallInternal。
### 3.7 JS_CallInternal （第二次）
JS_CallInternal  再调用时，我们的参数就很明确了，
参数： 执行上下文，log函数，console对象， new_target是undefined, 参数个数1，参数值‘hello world’。
在JS_CallInternal的开始部分代码里首先会根据当前fun_obj对应的class_id判断，如果不是JS_CLASS_BYTECODE_FUNCTION则会进入判断条件，在runtime中calss_array中取到class_id对应的函数，将参数传入执行。这个runtime的class_array是在new runtime中初始化，这里log的class_对应的id为JS_CLASS_C_FUNCTION。
```javascript

  if (unlikely(p->class_id != JS_CLASS_BYTECODE_FUNCTION)) {
          JSClassCall *call_func;
          call_func = rt->class_array[p->class_id].call;
          if (!call_func) {
              return JS_ThrowTypeError(caller_ctx, "not a function");
          }
          return call_func(caller_ctx, func_obj, this_obj, argc,
                         (JSValueConst *)argv, flags);
      }

```

从下图 可以看到它的call初始化为js_call_c_function。



<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/ba9fdb7e-c23d-4128-ac32-70bf72aeec4fimage.png" alt="图12" />
</div>
<div style="text-align: center;">
【图12】class_array初始化
</div>


到这里就会调用c的函数（ js_call_c_function ）去执行对应打印逻辑了。

## 4. quickjs 执行


<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/fe9e229a-eae3-4f9b-8e81-c2450bc88515image.png" alt="图13" />
</div>
<div style="text-align: center;">
【图13】quickjs函数执行流程
</div>


至此，整个quickjs解析并执行JS代码的主要流程已经接近尾声。
下面是quickjs执行过程的解读，首先介绍  js_call_c_function 这个函数。
### 4.1 js_call_c_function 
是quickjs中的一个函数，它的作用是调用一个C函数，并将其返回值转换为JSValue类型。
```javascript

static JSValue 				 
js_call_c_function(*ctx,func_obj,this_obj,argc,*argv,flags)


```
它的入参包括：
ctx：JSContext类型的指针，表示当前的JS执行上下文。
func_obj：JSValueConst类型的参数，表示要调用的JS函数对象。
this_obj：JSValueConst类型的参数，表示函数调用时的this对象。
argc：int类型的参数，表示传递给函数的参数个数。
argv：JSValueConst类型的指针，表示传递给函数的参数数组。
flags：int类型的参数，表示调用函数时的标志位。
其中，func_obj 和 this_obj 都是JSValueConst类型的参数，是quickjs中定义的一种基本数据类型，可以用JS_ToCFunction和JS_ToObject函数将其转换为C中的函数和对象。
argc和argv表示传递给函数的参数个数和数组，需要使用JS_ToInt32和JS_GetPropertyUint32函数获取。
flags表示调用函数时的标志位，可以设置为JS_CALL_FLAG_CONSTRUCTOR表示调用构造函数。

在 js_call_c_function 这个方法里，它 用 JS_VALUE_GET_OBJ 将 func_obj 这个函数对象 转化成了 JSObject 类型的指针p，然后通过指针p来获取函数对象 func_obj 的一些基本信息。
```javascript

  JSObject *p;
  p = JS_VALUE_GET_OBJ(func_obj);
  cproto = p->u.cfunc.cproto;
  arg_count = p->u.cfunc.length;
  func = p->u.cfunc.c_function;

```
其中，cproto表示C函数的参数类型，arg_count表示C函数的参数个数，func表示C函数的指针。
这些信息可用于调用C函数并传递参数。


<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/6e86cfa0-682b-44eb-978c-5f0e70c67be2image.png" alt="图14" />
</div>
<div style="text-align: center;">
【图14】调用的C语言函数本身及类型
</div>


```javascript

  func = p->u.cfunc.c_function;
  case JS_CFUNC_generic:
        ret_val = func.generic(ctx, this_obj, argc, arg_buf);
          break;

```
经过断点调试，我们可以确定接下来要执行的C语言函数是 js_print，这也就串起来了。
### 4.2 js_print
JS 中的 console.log("hello,world")，经过quickjs的一系列解析后，最终确定要执行 js_print 这个函数。
参数个数 argc 是1，argv是参数数组，所以 argv[0] 也就代表 hello,world 。
js_print 函数的功能不言而喻，就是将传入的字符串打印在控制台。
其中，我们需要 JS_ToCStringLen 这个函数，它的功能是将 JSValueConst （quickjs中的基本数据类型）转化为在C语言中的字符，也就与C语言的字符规范保持一致。
比如，需要判断即将打印的字符是否为宽字符编码（16位），是否为ASCII码，然后将宽字符转换为UTF-8编码，在字符串末尾设置为'\0'，最后为字符串分配空间。
最后，我们的 hello,world 如期而至，出现在控制台上。
```javascript

  static JSValue js_print(*ctx,this_val,argc,*argv)
  {
      int i;
      const char *str;
      size_t len;
      for(i = 0; i < argc; i++) {
          if (i != 0)
              putchar(' ');
          str = JS_ToCStringLen(ctx, &len, argv[i]);
          if (!str)
              return JS_EXCEPTION;
          fwrite(str, 1, len, stdout);
          JS_FreeCString(ctx, str);
      }
      putchar('\n');
      return JS_UNDEFINED;
  }

```

## 5. quickjs 补充

故事说到这里也就结束了，但是 js_call_c_function 与 js_print 之间如何建立起联系的呢？quickjs是如何确定接下来要执行哪个C语言函数呢？带着这样的疑惑，我们继续深入探索quickjs源码。
### 5.1 函数类型枚举
从 上文中提到 C语言函数类型 cproto 出发，可以查看所有的函数类型枚举值。
console.log("xxx") 对应着 JS_CFUNC_generic，也就是普通的C语言函数。
JS_CFUNC_generic：普通的C函数。
JS_CFUNC_generic_magic：带有魔数的C函数。
JS_CFUNC_constructor：构造函数。
JS_CFUNC_constructor_magic：带有魔数的构造函数。
JS_CFUNC_constructor_or_func：既可以作为构造函数，也可以作为普通函数使用。
JS_CFUNC_constructor_or_func_magic：带有魔数的既可以作为构造函数，也可以作为普通函数使用的函数。
JS_CFUNC_f_f：接受一个double类型的参数，返回一个double类型的值。
JS_CFUNC_f_f_f：接受两个double类型的参数，返回一个double类型的值。
JS_CFUNC_getter：getter函数。
JS_CFUNC_setter：setter函数。
JS_CFUNC_getter_magic：带有魔数的getter函数。
JS_CFUNC_setter_magic：带有魔数的setter函数。
JS_CFUNC_iterator_next：迭代器的next函数。
### 5.2 魔数
上文提到的魔数，指的是一个整数值，用于标识一个C函数的类型。
它通常被用于带有特殊功能的C函数，例如构造函数、getter和setter函数等。魔数的值可以是任意的，但是需要保证不与其他C函数的魔数值重复。
指定魔数的作用是为了方便地区分不同类型的对象。
例如，如果有一个构造函数用于创建字符串对象，另一个构造函数用于创建数字对象，那么可以为这两个构造函数分别指定不同的魔数，以便在创建对象时进行区分。
在调用带有魔数的C函数时，需要使用JS_CallMagicFunction函数，并将魔数值作为参数传递给它。这样，quickjs就可以根据魔数值来确定要调用的C函数的类型，并正确地处理它的返回值。
### 5.3 回顾
综上所述，quickjs是借助这种魔数来确定要调用的C语言类型，其实本质就是在源码里写好一套固定的机制，让代码在运行时自动判断要走的流程。举一反三，quickjs具体执行哪个C语言函数是不是也是写死在代码里的呢？
以 console.log()为例，确实如此！ C语言函数 js_print 与 JS函数 console.log() 之间的联系 就是在 js_std_add_helpers 这个函数里建立起来的。
```javascript


  void js_std_add_helpers(JSContext *ctx, int argc, char **argv)
  {
      JSValue global_obj, console, args;
      int i;
      global_obj = JS_GetGlobalObject(ctx);
      console = JS_NewObject(ctx);
      JS_SetPropertyStr(ctx, console, "log",
                      JS_NewCFunction(ctx, js_print, "log", 1));
      JS_SetPropertyStr(ctx, global_obj, "console", console);
    .......
  }

```
在quickjs 中，js_std_add_helpers方法是在JS_NewRuntimeContext函数中被调用的。这个方法的作用是添加一些常用的JavaScript全局对象和函数，例如 console对象、setTimeout函数等。
这些对象和函数可以方便地在JavaScript代码中使用，提高了开发效率。
同时，js_std_add_helpers方法还会设置一些默认的选项，例如内存分配器、错误处理器等，这为JavaScript代码的执行提供了必要的支持。

## 6. quickjs 总结

<div align="center">
    <img src="https://wos.58cdn.com.cn/IjGfEdCbIlr/ishare/a37f7b1d-a654-4d8b-9126-d297cfa3d6c7whiteboard_exported_image.png" alt="图15" />
</div>
<div style="text-align: center;">
【图15】整体流程图
</div>


上图就是神秘的quickjs在解释并执行 console.log("hello,world") 这样一段最简单的JS语句时的主要流程图。
经过上文的层层解读，我们可以知道quickjs的执行机制可以分为启动、解释、执行和补充四个阶段。
在启动阶段，quickjs会进行初始化和编译预处理，以便后续的解释和执行。
在解释阶段，quickjs会将JavaScript代码解释成字节码，并进行优化和缓存，以提高执行效率。
在执行阶段，quickjs会执行字节码，并进行垃圾回收和内存管理，以保证程序的稳定性和性能。
在补充阶段，quickjs会提供一些额外的功能和扩展，如支持ES6语法、异步编程和模块化等。
总之，quickjs的执行机制是一个充满神秘的过程，它用更少的代码量和内存成本实现了JS绝大多数的特性，
这一特点决定了quickjs在轻量级的应用程序、嵌入式开发等领域会有一席之地。
