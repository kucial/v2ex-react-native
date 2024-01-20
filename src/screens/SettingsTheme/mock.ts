export const topic = {
  id: 1,
  member: {
    avatar_normal:
      'https://cdn.v2ex.com/avatar/c4ca/4238/1_xlarge.png?m=1657258945',
    username: 'livid',
  },
  node: {
    name: 'v2ex',
    title: 'V2EX',
  },
  last_reply_by: 'kongkx',
  last_reply_time: '2小时18分钟前',
  title:
    '如果你在 V2EX 设置的个人网站地址那里填的是一个 ENS，现在会显示 ENS 的图标',
  replies: 200,
}

export const html = `
<h1>R2V</h1>

<p>R2V是一款为V2EX社区打造的第三方客户端应用，它的主要目的是让用户能够更加方便地访问和浏览V2EX社区的内容。<a href="https://apps.apple.com/cn/app/r2v/id1645766550">App Store</a></p>
<p><a href="https://github.com/kucial/v2ex-react-native">Github</a></p>

<ul>
  <li><strong>简洁的用户界面</strong>：R2V的用户界面非常简洁，易于使用。用户可以通过简单的手势和操作轻松地浏览和查看帖子和评论</li>
  <li><strong>多种主题选择</strong>：除默认主题外，提供了多种<em>强调色</em>主题供用户选择，以满足不同用户的审美和使用需求</li>
  <li><strong>自定义设置</strong>：用户可以做一些自定义设置，如修改列表显示样式，编辑首页标签等</li>
  <li><strong>剪切板监听</strong>：当用户复制内容包含链接时，显示打开链接提示。示例: https://www.github.com</li>
</ul>

<hr />

<h1>标题一</h1>

<h2>标题二</h2>

<h3>标题三</h3>

<h4>标题四</h4>

<h5>标题五</h5>

<h6>标题六</h6>

<p>普通段落内容</p>

<hr />
<h2>代码块</h2>

<pre><code class="hljs language-typescript"><span class="hljs-comment">// Define a variable with an explicit type</span>
<span class="hljs-keyword">let</span> <span class="hljs-attr">myName</span>: <span class="hljs-built_in">string</span> = <span class="hljs-string">"Alice"</span>;

<span class="hljs-comment">// Define a function with explicit parameter and return types</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">greet</span>(<span class="hljs-params">name: <span class="hljs-built_in">string</span></span>): <span class="hljs-built_in">string</span> {
  <span class="hljs-keyword">return</span> <span class="hljs-string">\`Hello, <span class="hljs-subst">\${name}</span>!\`</span>;
}

<span class="hljs-comment">// Define an interface</span>
<span class="hljs-keyword">interface</span> <span class="hljs-title class_">Person</span> {
  <span class="hljs-attr">name</span>: <span class="hljs-built_in">string</span>;
  <span class="hljs-attr">age</span>: <span class="hljs-built_in">number</span>;
}

<span class="hljs-comment">// Define a class that implements an interface</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">Student</span> <span class="hljs-keyword">implements</span> <span class="hljs-title class_">Person</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"><span class="hljs-keyword">public</span> name: <span class="hljs-built_in">string</span>, <span class="hljs-keyword">public</span> age: <span class="hljs-built_in">number</span></span>) {}
}

<span class="hljs-comment">// Create an instance of the class</span>
<span class="hljs-keyword">const</span> alice = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Student</span>(<span class="hljs-string">"Alice"</span>, <span class="hljs-number">20</span>);

<span class="hljs-comment">// Call the function and log the result to the console</span>
<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-title function_">greet</span>(alice.<span class="hljs-property">name</span>));
</code>
</pre>
<hr />

<h2>列表</h2>
<ul>
<li>Unordered lists</li>
<li>can be created</li>
<li>with asterisks</li>
<li>or dashes</li>
</ul>

<ol>
<li>Ordered lists</li>
<li>can also be created</li>
<li>with numbers</li>
</ol>
<hr />

<h2>引用</h2>

<blockquote>
<p>Blockquotes can be created with a greater than sign.</p>
</blockquote>
<hr />

<h2>图片</h2>
<p><img src="https://picsum.photos/id/220/600/400" alt="Images"> can be added with an exclamation mark and square brackets containing the alt text and parentheses containing the image URL.</p>
<hr />

<h2>表格</h2>

<table>
<thead>
<tr>
<th>Tables</th>
<th>can</th>
<th>be</th>
<th>created</th>
</tr>
</thead>
<tbody>
<tr>
<td>like</td>
<td>this</td>
<td>using</td>
<td>pipes</td>
</tr>
</tbody>
</table>


<hr />

<h2>iframe</h2>
<iframe src="https://www.youtube.com/embed/ic8j13piAhQ?list=RDCLAK5uy_kmPRjHDECIcuVwnKsx2Ng7fyNgFKWNJFs" title="Taylor Swift - Cruel Summer (Official Audio)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<hr />

`
