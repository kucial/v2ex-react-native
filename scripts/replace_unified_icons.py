#!/usr/bin/env python3
import os
import re

SRC_DIR = 'src'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # 1. Update Imports
    # Remove old imports
    content = re.sub(r"import\s+HeroiconsOutline\s+from\s+['\"]@/components/icons/HeroiconsOutline['\"]\n?", '', content)
    content = re.sub(r"import\s+HeroiconsSolid\s+from\s+['\"]@/components/icons/HeroiconsSolid['\"]\n?", '', content)
    content = re.sub(r"import\s+ReplyIcon\s+from\s+['\"]@/components/ReplyIcon['\"]\n?", '', content)
    content = re.sub(r"import\s+MarkdownIcon\s+from\s+['\"]@/components/MarkdownIcon['\"]\n?", '', content)
    content = re.sub(r"import\s+MarkdownFilledIcon\s+from\s+['\"]@/components/MarkdownFilledIcon['\"]\n?", '', content)
    
    # Needs V2exIcon?
    needs_v2ex = bool(re.search(r'<(HeroiconsOutline|HeroiconsSolid|ReplyIcon|MarkdownIcon|MarkdownFilledIcon)\b', original) or re.search(r'\b(HeroiconsOutline|HeroiconsSolid|ReplyIcon|MarkdownIcon|MarkdownFilledIcon)\b', original))
    if needs_v2ex:
        # Check if already imported
        if 'import V2exIcon' not in content:
            # We'll just insert it after the last import of react/react-native/expo, or at the top of local imports
            # As a simple heuristic, replace the first occurrence of an old import with V2exIcon.
            # But we already removed them. Let's just find any import from '@/components...' and insert before it
            match = re.search(r"import .* from ['\"]@/components/.*", content)
            if match:
                content = content[:match.start()] + "import V2exIcon from '@/components/icons/V2exIcon'\n" + content[match.start():]
            else:
                # just put it near the top
                match = re.search(r"import .* from .*\n", content)
                if match:
                    content = content[:match.end()] + "import V2exIcon from '@/components/icons/V2exIcon'\n" + content[match.end():]
                else:
                    content = "import V2exIcon from '@/components/icons/V2exIcon'\n" + content
    
    # 2. Replace component tags
    # <HeroiconsOutline name="home" ... /> -> <V2exIcon name="home-outline" ... />
    def replace_outline(m):
        name = m.group(1)
        rest = m.group(2)
        return f'<V2exIcon name="{name}-outline"{rest}'
        
    content = re.sub(r'<HeroiconsOutline\s+name=[\'"]([^\'"]+)[\'"](.*?)', replace_outline, content)
    
    def replace_solid(m):
        name = m.group(1)
        rest = m.group(2)
        return f'<V2exIcon name="{name}-solid"{rest}'
        
    content = re.sub(r'<HeroiconsSolid\s+name=[\'"]([^\'"]+)[\'"](.*?)', replace_solid, content)
    
    # Custom components
    content = re.sub(r'<ReplyIcon(.*?)', r'<V2exIcon name="reply-outline"\1', content)
    content = re.sub(r'<MarkdownIcon(.*?)', r'<V2exIcon name="markdown-outline"\1', content)
    content = re.sub(r'<MarkdownFilledIcon(.*?)', r'<V2exIcon name="markdown-solid"\1', content)
    
    # 3. Replace reference usages (like Icon={HeroiconsOutline})
    # Wait, we changed them to inline functions before: `Icon={(props) => <HeroiconsOutline name="home" {...props} />}`
    # Which will be caught by the regex above!
    # Let's check for any remaining direct references:
    content = re.sub(r'\bReplyIcon\b', '(props) => <V2exIcon name="reply-outline" {...props} />', content)
    content = re.sub(r'\bMarkdownIcon\b', '(props) => <V2exIcon name="markdown-outline" {...props} />', content)
    content = re.sub(r'\bMarkdownFilledIcon\b', '(props) => <V2exIcon name="markdown-solid" {...props} />', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            # Skip the definition files themselves
            if 'V2exIcon.ts' in filepath or 'HeroiconsOutline.ts' in filepath or 'HeroiconsSolid.ts' in filepath:
                continue
            process_file(filepath)
