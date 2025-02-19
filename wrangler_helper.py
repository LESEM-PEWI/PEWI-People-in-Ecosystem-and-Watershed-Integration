import os
import xlwings as xw


def get_all_book_sheet_names(book_path):
    assert os.path.exists(book_path), f"No such file or directory: {book_path}"""
    wb = xw.Book(book_path)
    try:
        # Get all sheet names
        sheet_names = [sheet.name for sheet in wb.sheets]
        return sheet_names
    finally:
        wb.close()


some_sheet_names = ['C following SB',
                    'C following C',
                    'Conservation C',
                    'SB following C',
                    'Conservation SB',
                    'Alfalfa Hay',
                    'Grass Hay',
                    'Switchgrass',
                    'SRWC ',
                    'Perm Pasture',
                    'Rotational Grazing']

sheet_names_values = {'C following SB': {'LU_ID': 1, 'Land-Use': 'Conventional Corn', 'Sub Crop': 'corn aftersoy'},
                      'C following C': {'LU_ID': 1, 'Land-Use': 'Conventional Corn', 'Sub Crop': 'Corn after Corn'},
                      'Conservation C': {'LU_ID': 2, 'Land-Use': 'Conservation Corn', 'Sub Crop': 'Corn after Corn'},
                      'SB following C': {'LU_ID': 3, 'Land-Use': 'Conservation Soybean', 'Sub Crop': 'corn aftersoy'},
                      'Conservation SB': {'LU_ID': 4, 'Land-Use': 'Conservation Soybean', 'Sub Crop': 'corn aftersoy'},
                      'Alfalfa Hay': {'LU_ID': 5, 'Land-Use': 'Alfalfa', 'Sub Crop': None},
                      'Grass Hay': {'LU_ID': 8, 'Land-Use': 'Grass Hay', 'Sub Crop': None},
                      'Switchgrass': {'LU_ID': 12, 'Land-Use': 'Switchgrass', 'Sub Crop': None},
                      'SRWC ': {'LU_ID': 13, 'Land-Use': 'Short rotation woody perennial', 'Sub Crop': None},
                      'Perm Pasture': {'LU_ID': 6, 'Land-Use': 'Permanent pasture', 'Sub Crop': None},
                      'Rotational Grazing': {'LU_ID': 7, 'Land-Use': 'Rotational Grazing', 'Sub Crop': None}}


def copy_xlsx_book(book_path, new_book_path=None):
    assert book_path.endswith('.xlsx'), f'Invalid book path {book_path}'
    # Open the original workbook
    app = xw.App(visible=False)
    wb_original = app.books.open(book_path)
    if new_book_path:
        if not new_book_path.endswith('.xlsx'):
            new_book_path = new_book_path + '.xlsx'
    else:
        new_book_path = 'copy_' + book_path
    # Create a new workbook
    wb_copy = app.books.open(new_book_path)
    try:
        # Loop through each sheet in the original workbook and copy it to the new one
        for sheet in wb_original.sheets:
            sheet.copy(after=wb_copy.sheets[-1])  # Copy sheet after the last sheet

        # Remove the default blank sheet in the new workbook
        if len(wb_copy.sheets) > 1:
            wb_copy.sheets[0].delete()

        # Save the copied workbook

        wb_copy.save(new_book_path)
        return new_book_path
    finally:

        # Close both workbooks
        wb_original.close()
        wb_copy.close()
