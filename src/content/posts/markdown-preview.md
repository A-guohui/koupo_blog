---
title: MarkDown使用手册
date: 2024-12-16T20:37:00+08:00
tags:
  - MarkDown
---

# 标题

```markdown
# H1

## H2

### H3

#### H4

##### H5

###### H6
```

<!--more-->

# H1

## H2

### H3

#### H4

##### H5

###### H6


# 段落

```markdown
这是一个段落. // [!code --]
这里仍然是一个段落. // [!code ++]

新的段落.
```

This is a paragraph.
I am still part of the paragraph.

New paragraph.

# 长段落

```markdown
Hey, you know how I'm, like, always trying to save the planet? Here's my chance. Must go faster... go, go, go, go, go! Jaguar shark! So tell me - does it really exist? Forget the fat lady! You're obsessed with the fat lady! Drive us out of here! I was part of something special.

My dad once told me, laugh and the world laughs with you, Cry, and I'll give you something to cry about you little bastard! We gotta burn the rain forest, dump toxic waste, pollute the air, and rip up the OZONE! 'Cause maybe if we screw up this planet enough, they won't want it anymore!

Must go faster... go, go, go, go, go! This thing comes fully loaded. AM/FM radio, reclining bucket seats, and... power windows. Must go faster... go, go, go, go, go! Yeah, but John, if The Pirates of the Caribbean breaks down, the pirates don’t eat the tourists.

Yeah, but John, if The Pirates of the Caribbean breaks down, the pirates don’t eat the tourists. Is this my espresso machine? Wh-what is-h-how did you get my espresso machine? This thing comes fully loaded. AM/FM radio, reclining bucket seats, and... power windows.
```

# 行内代码

This is `Inline code`.

# 图片

```markdown
网络图片

![Web Image](https://i.loli.net/2019/04/13/5cb1d33cf0ee6.jpg)

本地图片

![Local Image](../attachments/100.jpg)
```

网络图片

![Web Image](https://i.loli.net/2019/04/13/5cb1d33cf0ee6.jpg)

本地图片

![Local Image](../attachments/100.jpg)

# 高亮块

```markdown
> This is a block quote
```

> This is a block quote

# 代码块

````markdown
```javascript
// Fenced **with** highlighting
function doIt() {
    for (var i = 1; i <= slen ; i^^) {
        setTimeout("document.z.textdisplay.value = newMake()", i*300);
        setTimeout("window.status = newMake()", i*300);
    }
}
```
````

```javascript
function doIt() {
    for (var i = 1; i <= slen ; i^^) {
        setTimeout("document.z.textdisplay.value = newMake()", i*300);
        setTimeout("window.status = newMake()", i*300);
    }
}
```

````markdown
```go
// Fenced **with** highlighting
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```
````

```go
// Fenced **with** highlighting
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

# 表格

```markdown
| Colors     |     Fruits      |         Vegetable |
| ---------- | :-------------: | ----------------: |
| Red        |     _Apple_     | [Pepper](#Tables) |
| ~~Orange~~ |     Oranges     |        **Carrot** |
| Green      | ~~**_Pears_**~~ |           Spinach |
```

| Colors     |     Fruits      |         Vegetable |
| ---------- | :-------------: | ----------------: |
| Red        |     _Apple_     | [Pepper](#Tables) |
| ~~Orange~~ |     Oranges     |        **Carrot** |
| Green      | ~~**_Pears_**~~ |           Spinach |

# 列表

#### 有序列表

```markdown
1. First item
2. Second item
3. Third item
```

1. First item
2. Second item
3. Third item

#### 无序列表

```markdown
- First item
- Second item
- Third item
```

- First item
- Second item
- Third item

# 数学公式

```tex
$$
evidence\_{i}=\sum\_{j}W\_{ij}x\_{j}+b\_{i}
$$

$$
AveP = \int_0^1 p(r) dr
$$

When $a \ne 0$, there are two solutions to \(ax^2 + bx + c = 0\) and they are
$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$
```

$$
evidence\_{i}=\sum\_{j}W\_{ij}x\_{j}+b\_{i}
$$

$$
AveP = \int_0^1 p(r) dr
$$

When $a \ne 0$, there are two solutions to \(ax^2 + bx + c = 0\) and they are
$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$

#### 表情

这里是一些简单的🌰子.
:smile:
:see_no_evil:
:smile_cat:
:watermelon:

# 分割线

 1. 短划线（---）

    ---

 2. 星号（***）
    ***
    ***
 3. 下划线（___）
    ___
    ___
    ___
