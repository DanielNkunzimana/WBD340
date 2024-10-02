--Use an inner join
SELECT inv.inv_make, inv.inv_model, class.classification_name
FROM public.inventory AS inv
INNER JOIN public.classification AS class
    ON inv.classification_id = class.classification_id
WHERE class.classification_name = 'Sport';

SELECT * FROM public.inventory

--Update all records in the inventory table with the image and thumbnail filenames
UPDATE public.inventory
SET 
    inv_image = CONCAT('/images/vehicles/', SUBSTRING(inv_image FROM 9)),
    inv_thumbnail = CONCAT('/images/vehicles/', SUBSTRING(inv_thumbnail FROM 9));

SELECT * FROM public.inventory