import os
from datetime import datetime

# Excluded folders/files
EXCLUDE_LIST = ['.venv', 'venv', '__pycache__', '.git', 'node_modules', '.next']

def get_file_metadata(file_path):
    """
    Retrieves metadata for a given file.
    :param file_path: Full path to the file.
    :return: A dictionary with metadata (size, last modified, etc.).
    """
    stats = os.stat(file_path)
    size = stats.st_size  # File size in bytes
    modified_time = datetime.fromtimestamp(stats.st_mtime).strftime('%Y-%m-%d %H:%M:%S')  # Last modified
    return {'size': size, 'last_modified': modified_time}

def list_files_and_folders(start_path='.', indent=0, output_file=None, metadata_file=None, show_metadata=False, verbose=False):
    """
    Recursively lists all files and folders, with optional metadata.
    :param start_path: Directory to start from.
    :param indent: Level of indentation for pretty printing.
    :param output_file: File handle to write the output (optional).
    :param metadata_file: File handle for tabular metadata output (optional).
    :param show_metadata: Boolean flag to include metadata in a separate file.
    :param verbose: Boolean flag to print progress messages to the terminal.
    """
    try:
        for item in os.listdir(start_path):
            # Full path of the item
            item_path = os.path.join(start_path, item)

            # Skip items in the EXCLUDE_LIST
            if item in EXCLUDE_LIST:
                continue

            # Format the directory structure line
            line = f"{'│   ' * indent}├── {item}"

            # Print to console if verbose
            if verbose:
                print(line)

            # Write to file_structure.txt
            if output_file:
                output_file.write(line + '\n')

            # Add metadata to metadata_file if enabled
            if show_metadata and metadata_file and os.path.isfile(item_path):
                metadata = get_file_metadata(item_path)
                metadata_file.write(f"{item_path}\t{metadata['size']}\t{metadata['last_modified']}\n")

            # If it's a folder, recurse into it
            if os.path.isdir(item_path):
                list_files_and_folders(item_path, indent + 1, output_file, metadata_file, show_metadata, verbose)
    except PermissionError:
        # Handle permission errors gracefully
        error_message = f"Permission denied: {start_path}"
        if verbose:
            print(error_message)
        if output_file:
            output_file.write(error_message + '\n')

def main():
    # Get the current folder name
    current_folder = os.path.basename(os.getcwd())

    # Output files
    structure_file = "file_structure.txt"
    metadata_file_name = "file_structure_metadata.txt"

    # Flags
    show_metadata = True   # Change this to False to disable metadata generation
    verbose = False        # Change this to True to print on the terminal

    # Write the directory structure and metadata
    with open(structure_file, 'w', encoding='utf-8') as structure_f:
        # Write metadata only if enabled
        if show_metadata:
            with open(metadata_file_name, 'w', encoding='utf-8') as metadata_f:
                # Write title to file_structure.txt
                title = f"Directory Structure for '{current_folder}':\n"
                if verbose:
                    print(title)
                structure_f.write(title + "\n")

                # Write headers to metadata file
                metadata_f.write("File Path\tSize (bytes)\tLast Modified\n")

                # List files and folders
                list_files_and_folders('.', output_file=structure_f, metadata_file=metadata_f, show_metadata=show_metadata, verbose=verbose)
        else:
            # Write title to file_structure.txt
            title = f"Directory Structure for '{current_folder}':\n"
            if verbose:
                print(title)
            structure_f.write(title + "\n")

            # List files and folders without metadata
            list_files_and_folders('.', output_file=structure_f, show_metadata=show_metadata, verbose=verbose)

    # Completion messages
    print(f"\nDirectory structure saved to '{structure_file}'.")
    if show_metadata:
        print(f"Metadata saved to '{metadata_file_name}'.")

if __name__ == "__main__":
    main()
