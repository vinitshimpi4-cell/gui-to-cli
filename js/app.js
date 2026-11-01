(function () {
  'use strict';
  var P = '[ec2-user@ip-172-31-xx-xx ~]$ ';
  var STEPS = [
    { t: 'Log in to the Console', s: 'Ravi opens the GUI', plain: 'Ravi signs in to the cloud city\'s control room: a website full of screens and buttons.', tech: 'The AWS Management Console is a browser-based GUI. It is friendly for beginners because you can see and click resources. You pick an account and a Region (a geographic location) at the top.', cmds: [], watch: 'The blue browser window appears with a services search bar and a Region selector.', term: [] },
    { t: 'Go to Amazon S3', s: 'Search for S3', plain: 'S3 is the cloud storage warehouse. Ravi searches "S3" and opens it.', tech: 'Amazon S3 stores objects (files) inside buckets. A bucket is a container; each object has a key (its name).', cmds: [], watch: 'The pointer moves along the dashed line to the S3 warehouse.', term: [] },
    { t: 'Create a bucket', s: 'Name, Region, privacy', plain: 'Ravi builds a storage container in the warehouse and keeps it private.', tech: 'Bucket names are globally unique across all AWS accounts. ravi-cloud-storage-demo-2026 is only an example; choose another if it is taken. Keep Block Public Access on.', cmds: [], watch: 'A bucket box lands in the S3 warehouse.', term: [] },
    { t: 'Open EC2 and configure', s: 'Plan the server', plain: 'Ravi rents a computer in the cloud and picks its settings.', tech: 'EC2 provides virtual servers. An AMI is the starting disk image; Amazon Linux 2023 is built for AWS. SSH (TCP 22) is needed to log in, so restrict it to your IP. Pick a free-tier-eligible type only if the console offers one; eligibility varies.', cmds: [], watch: 'The orange EC2 box shows the launch settings.', term: [] },
    { t: 'Launch and connect', s: 'Pending, Running, terminal', plain: 'The computer starts up and Ravi walks into its command room.', tech: 'After Pending becomes Running, use the EC2 Instance Connect button for a browser terminal, or SSH from your own machine with your key pair.', cmds: ['ssh -i ravi-key.pem ec2-user@YOUR_PUBLIC_IP'], watch: 'The terminal shows the Amazon Linux prompt.', term: [P + '_'] },
    { t: 'Update Amazon Linux', s: 'Package manager', plain: 'Ravi installs the latest fixes before adding tools.', tech: 'A package manager downloads and installs software and security updates. Amazon Linux 2023 uses dnf; Amazon Linux 2 uses yum. "sudo su" opens a root shell, but using sudo for single commands is safer.', cmds: ['sudo dnf update -y', 'sudo yum update -y   # Amazon Linux 2 only'], watch: 'The progress bar fills as updates install.', term: [P + 'sudo dnf update -y', 'Dependencies resolved.', 'Downloading Packages...', 'Complete!', P + '_'] },
    { t: 'Install AWS CLI v2', s: 'The translator', plain: 'AWS CLI turns typed commands into requests AWS understands.', tech: 'Check first whether it is installed. If not, follow the official AWS guide for your architecture (x86_64 or aarch64). Do not assume yum install awscli gives v2. Docs: docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html', cmds: ['aws --version'], watch: 'A package slides into the EC2 box and becomes AWS CLI v2.', term: [P + 'aws --version', 'aws-cli/2.x.x Python/3.x Linux/...', P + '_'] },
    { t: 'Create IAM user and keys', s: 'Identity and permissions', plain: 'The security department issues Ravi an ID number (Access Key ID) and a password (Secret Access Key).', tech: 'In IAM: Users, Create user, attach only the needed permissions (s3:ListAllMyBuckets for aws s3 ls), then create an access key for CLI use. Keep the secret private, never type it in commands or commit it to GitHub. In production, prefer an IAM role attached to the EC2 instance.', cmds: [], watch: 'Keys travel from the Console to IAM and on to the terminal; no real values appear.', term: [P + '# keys are entered only at', '# the aws configure prompt', P + '_'] },
    { t: 'Configure and verify', s: 'aws configure + sts', plain: 'Ravi gives the translator his ID and checks that AWS recognises him.', tech: 'aws configure stores keys in ~/.aws/credentials and settings in ~/.aws/config. The Region sets the default; json is the output format. sts get-caller-identity proves authentication, not permission for every service.', cmds: ['aws configure', 'aws sts get-caller-identity'], watch: 'A signed request reaches the AWS API, IAM checks it, and a green check returns.', term: [P + 'aws configure', 'AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID', 'AWS Secret Access Key [None]: ****', 'Default region name: ap-south-1', 'Default output format: json', P + 'aws sts get-caller-identity', '{"Account": "123456789012"}'] },
    { t: 'List buckets: it works', s: 'aws s3 ls + architecture', plain: 'Ravi asks the warehouse for its containers and sees the bucket he made by clicking.', tech: 'CLI reads credentials, signs the request, sends it over HTTPS to the AWS API, IAM evaluates permissions, S3 returns the list. The Console and CLI are two interfaces to the same AWS resources; the CLI does not connect to the Console. More commands need matching IAM permissions.', cmds: ['aws s3 ls', 'aws s3 ls s3://YOUR-BUCKET-NAME', 'aws s3 mb s3://YOUR-NEW-BUCKET-NAME', 'aws s3 cp example.txt s3://YOUR-BUCKET-NAME/'], watch: 'The request goes out, the green document returns, and the SUCCESS banner lights up.', term: [P + 'aws s3 ls', '2026-11-01 10:30:00 ravi-cloud-storage-demo-2026', '(illustrative output)', P + '_'] }
  ];
  var cur = 1, timer = null, fixed = false;
  var $ = function (id) { return document.getElementById(id); };
  var groups = Array.prototype.slice.call(document.querySelectorAll('.s'));
  var svg = $('dia');

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  function buildNav() {
    STEPS.forEach(function (st, i) {
      var b = el('button', 'step');
      var d = el('span'); d.appendChild(document.createTextNode(st.t)); d.appendChild(el('small', '', st.s));
      b.appendChild(el('b', '', String(i + 1))); b.appendChild(d);
      b.addEventListener('click', function () { stop(); go(i + 1); });
      $('steps').appendChild(b);
    });
  }

  function renderTerm(lines) {
    var t = $('term'); t.textContent = '';
    lines.forEach(function (l, i) {
      var s = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      s.setAttribute('x', '418'); s.setAttribute('dy', i ? '16' : '0'); s.textContent = l; t.appendChild(s);
    });
  }

  function renderCap(st) {
    var c = $('cap'); c.textContent = '';
    c.appendChild(el('h2', '', 'Step ' + cur + ': ' + st.t));
    [['In plain words', st.plain], ['Technical explanation', st.tech]].forEach(function (x) { c.appendChild(el('h3', '', x[0])); c.appendChild(el('p', '', x[1])); });
    if (st.cmds.length) {
      c.appendChild(el('h3', '', 'Commands'));
      st.cmds.forEach(function (cmd) {
        var row = el('div', 'cmd'); row.appendChild(el('code', '', cmd));
        var b = el('button', '', 'Copy'); b.setAttribute('aria-label', 'Copy command: ' + cmd);
        b.addEventListener('click', function () {
          var txt = cmd.split('   #')[0];
          var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1200); };
          if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(done, function () {}); }
        });
        row.appendChild(b); c.appendChild(row);
      });
    }
    c.appendChild(el('h3', '', 'Watch the picture')); c.appendChild(el('p', '', st.watch));
  }

  function go(n) {
    cur = Math.max(1, Math.min(10, n));
    groups.forEach(function (g) {
      var k = +g.dataset.s;
      g.classList.toggle('on', k <= cur); g.classList.remove('new');
      if (k === cur) { void g.getBoundingClientRect(); g.classList.add('new'); }
    });
    var st = STEPS[cur - 1];
    renderTerm(st.term);
    renderCap(st);
    Array.prototype.forEach.call($('steps').children, function (b, i) { b.classList.toggle('cur', i === cur - 1); if (i === cur - 1) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    $('prev').disabled = cur === 1; $('next').disabled = cur === 10;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } $('auto').setAttribute('aria-pressed', 'false'); $('auto').textContent = 'Auto-play'; }
  function start() {
    if (cur === 10) go(1);
    $('auto').setAttribute('aria-pressed', 'true'); $('auto').textContent = 'Pause';
    timer = setInterval(function () { if (cur >= 10) { stop(); } else { go(cur + 1); } }, 5000);
  }

  function setFix(ok) {
    fixed = ok;
    $('tsIcon').textContent = ok ? '✅' : '❌';
    $('tsMsg').textContent = ok ? 'Permission added: request succeeded' : 'AccessDenied: add s3:ListAllMyBuckets';
    $('tsMsg').setAttribute('fill', ok ? '#8ff0c4' : '#ff8a8a');
  }

  $('prev').addEventListener('click', function () { stop(); go(cur - 1); });
  $('next').addEventListener('click', function () { stop(); go(cur + 1); });
  $('auto').addEventListener('click', function () { if (timer) stop(); else start(); });
  $('reset').addEventListener('click', function () { stop(); setFix(false); go(1); });
  $('fix').addEventListener('click', function () { setFix(!fixed); if (cur < 10) go(10); });
  $('theme').addEventListener('click', function () {
    var h = document.documentElement; h.dataset.theme = h.dataset.theme === 'dark' ? 'light' : 'dark';
  });
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches && svg.pauseAnimations) svg.pauseAnimations();

  buildNav(); go(1);
})();
