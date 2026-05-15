
import os

def update_file():
    index_path = 'index.html'
    new_certs_path = 'new_certs.html'
    
    with open(index_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    with open(new_certs_path, 'r', encoding='utf-8') as f:
        new_content = f.read()
        
    # Find the start and end of the certs container
    start_index = -1
    end_index = -1
    
    for i, line in enumerate(lines):
        if '<div class="certs-container">' in line:
            start_index = i
        if start_index != -1 and '</div>' in line:
            # Check indentation or context to be sure it's the closing div of certs-container
            # Logic: We know it ends before "Slide 6: Projects" or </section>
            pass
            
    # More robust finding strategy using known lines from view_file
    # Start: line 565 (approx)
    # End: line 826 (approx)
    
    # Let's find index by content matching strict lines 
    start_found = False
    end_found = False
    
    final_lines = []
    skip = False
    
    for line in lines:
        if '<div class="certs-container">' in line and not start_found:
            start_found = True
            skip = True
            final_lines.append(new_content)
            continue
            
        if skip:
            # We are inside the block to replace.
            # We need to find the specific closing div.
            # Based on file inspection, the closing div is followed by </div> then </section> and then 'Slide 6'
            # But simpler: we know the structure.
            # The structure is:
            # <div class="certs-container"> ... </div> (closing certs container)
            # </div> (closing content)
            # </section>
            
            # Let's look for the </div> that precedes closing content div.
            # Actually, regex or simple line skipping is risky without exact line counts.
            pass
            
    # Let's use the line numbers observed from view_file since I haven't modified the file yet.
    # Start Line: 565 (1-based) -> index 564
    # End Line: 826 (1-based) -> index 825
    
    # Refined Approach: Splicing based on explicit markers
    
    pre_lines = []
    post_lines = []
    
    mode = 'pre'
    
    for line in lines:
        if mode == 'pre':
            if '<div class="certs-container">' in line:
                mode = 'skip'
                # Don't append this line, we replace it
            else:
                pre_lines.append(line)
        elif mode == 'skip':
            # We look for </section> which marks the end of the slide, 
            # then backtrack to find the closing div of certs-container?
            # No, that's hard.
            
            # Let's look for the START of the NEXT slide.
            if '<!-- Slide 6: Projects -->' in line:
                mode = 'post'
                # We need to restore the closing tags for the previous section that came BEFORE this line
                # The previous section (certs) structure:
                # <section ...>
                #   <div class="content">
                #      <div class="certs-container"> ... </div>
                #   </div>
                # </section>
                
                # So before "Slide 6" we should have:
                # </div>
                # </section>
                # (and maybe some empty lines)
                
                # So we simply append the new content when we hit the start tag, and then wait until we hit the next section?
                # But we need to keep the closing </div></section> of Slide 5.
                
                post_lines.append('                </div>\n') # Closing .content
                post_lines.append('            </section>\n') # Closing .slide
                post_lines.append('\n')
                post_lines.append('\n')
                post_lines.append(line) # Slide 6 comment
            
            # If we don't hit Slide 6, we are skipping lines inside Slide 5 (Certs).
            # But we must be careful not to delete the closing tags of Slide 5 content if we rely on "Slide 6" to stop skipping.
            
    # Better approach:
    # We replaced lines 565 to 826 in the thought process.
    # Let's validly assume the lines from view_file are accurate since no edits happened.
    # Line 565 is <div class="certs-container">
    # Line 826 is </div> which closes certs-container
    
    # Correct indices (0-based):
    # Start: 564
    # End: 826 (exclusive of the closing div? No, we want to remove the closing div and replace it with new content which includes it)
    
    # Let's verify line 564 content
    if 'certs-container' not in lines[564]:
        print(f"Error: Line 564 is '{lines[564]}', expected certs-container")
        # Fallback search
        for i, l in enumerate(lines):
            if '<div class="certs-container">' in l:
                print(f"Found certs-container at {i}")
                start_idx = i
                break
    else:
        start_idx = 564
        
    # Find end index: The closing </div> for certs-container.
    # It is indented.
    # In view_file output, line 826 was </div>. (Index 825)
    
    # Let's check line 825
    if '</div>' not in lines[825]:
         print(f"Error: Line 825 is '{lines[825]}', expected </div>")
         # We need to find the end.
         # The next slide starts at line 832/833 (Index 832)
         # So we can just delete everything from start_idx up to (but not including) the closing tags of the section.
         pass
         
    # Let's just find "Slide 6: Projects" and work backwards?
    # Or start from start_idx and count brackets? (Too complex)
    
    # Simplest: Replace from start_idx until we see <!-- Slide 6: Projects -->
    # AND keep the closing tags for the section.
    
    # Let's find the Next Slide line
    next_slide_idx = -1
    for i, line in enumerate(lines):
        if '<!-- Slide 6: Projects -->' in line:
            next_slide_idx = i
            break
            
    if next_slide_idx == -1:
        print("Could not find Slide 6")
        return

    # We want to keep the lines:
    # </div> (closing content) -> likely next_slide_idx - 4 or so
    # </section> -> likely next_slide_idx - 3 or so
    
    # Loop backwards from next_slide_idx to find the closing </section>
    section_end_idx = -1
    for i in range(next_slide_idx, start_idx, -1):
        if '</section>' in lines[i]:
            section_end_idx = i
            break
            
    # The line before </section> is </div> (closing content).
    content_end_idx = -1
    for i in range(section_end_idx, start_idx, -1):
        if '</div>' in lines[i] and i != section_end_idx: # The one strictly before section end (ignoring whitespace)
             # But wait, lines[i] might be empty
             pass
    
    # Let's rely on exact line replacement from 565 to 826 (1-based) => 564 to 825 (0-based) inclusive.
    # We replace lines[564:826] with new_content.
    
    lines[564:826] = [new_content + '\n']
    
    with open(index_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
        
    print("Success")

if __name__ == '__main__':
    update_file()
