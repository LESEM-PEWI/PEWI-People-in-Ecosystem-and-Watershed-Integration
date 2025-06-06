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

sheet_names_values = {'C following SB': {'LU_ID': 1, 'Land-Use': 'Conventional Corn', 'Sub Crop': 'corn after soy'},
                      'C following C': {'LU_ID': 1, 'Land-Use': 'Conventional Corn', 'Sub Crop': 'Corn after Corn'},
                      'Conservation C': {'LU_ID': 2, 'Land-Use': 'Conservation Corn', 'Sub Crop': 'Corn after Corn'},
                      'SB following C': {'LU_ID': 3, 'Land-Use': 'Conservation Soybean', 'Sub Crop': 'soy after corn'},
                      'Conservation SB': {'LU_ID': 4, 'Land-Use': 'Conservation Soybean', 'Sub Crop': 'soy after soy'},
                      'Alfalfa Hay': {'LU_ID': 5, 'Land-Use': 'Alfalfa', 'Sub Crop': None},
                      'Grass Hay': {'LU_ID': 8, 'Land-Use': 'Grass Hay', 'Sub Crop': None},
                      'Switchgrass': {'LU_ID': 12, 'Land-Use': 'Switchgrass', 'Sub Crop': None},
                      'SRWC ': {'LU_ID': 13, 'Land-Use': 'Short rotation woody perennial', 'Sub Crop': None},
                      'Perm Pasture': {'LU_ID': 6, 'Land-Use': 'Permanent pasture', 'Sub Crop': None},
                      'Rotational Grazing': {'LU_ID': 7, 'Land-Use': 'Rotational Grazing', 'Sub Crop': None},
                      'Wetland Restoration': {'LU_ID': 14, 'Land-Use': 'Wetland', 'Sub Crop': None},
                      'Prairie': {'LU_ID': 9, 'Land-Use': 'Prairie', 'Sub Crop': None}
                      }
